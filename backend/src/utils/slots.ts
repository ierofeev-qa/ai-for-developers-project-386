import type { TimeSlot } from '../types/index.js';

// Рабочие часы
const WORKING_HOURS_START = 9; // 09:00
const WORKING_HOURS_END = 18; // 18:00
const SLOT_INTERVAL_MINUTES = 30;

/**
 * Получает начало дня (00:00:00.000)
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Получает конец дня (23:59:59.999)
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Добавляет дни к дате
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Добавляет минуты к дате
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Проверяет, является ли дата рабочим днем (не выходным)
 */
export function isWorkingDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6; // Не воскресенье и не суббота
}

/**
 * Проверяет, находится ли время в рабочих часах
 */
export function isWorkingHours(date: Date): boolean {
  const hour = date.getHours();
  return hour >= WORKING_HOURS_START && hour < WORKING_HOURS_END;
}

/**
 * Получает массив дат в диапазоне
 */
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Генерирует временные слоты для одного дня
 */
export function generateSlotsForDay(date: Date, durationMinutes: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const currentDate = new Date(date);
  currentDate.setHours(WORKING_HOURS_START, 0, 0, 0);
  
  const endOfWorkDay = new Date(date);
  endOfWorkDay.setHours(WORKING_HOURS_END, 0, 0, 0);
  
  while (currentDate < endOfWorkDay) {
    const slotEnd = addMinutes(currentDate, durationMinutes);
    
    // Проверяем, что слот умещается в рабочий день
    if (slotEnd <= endOfWorkDay) {
      slots.push({
        startTime: currentDate.toISOString(),
        endTime: slotEnd.toISOString(),
        isAvailable: true, // Будет обновлено позже
      });
    }
    
    currentDate.setMinutes(currentDate.getMinutes() + SLOT_INTERVAL_MINUTES);
  }
  
  return slots;
}

/**
 * Генерирует все слоты для окна бронирования
 */
export function generateAvailableSlots(
  startDate: Date,
  days: number,
  durationMinutes: number,
  bookedRanges: Array<{ startTime: string; endTime: string }>
): TimeSlot[] {
  const endDate = addDays(startDate, days);
  const dates = getDatesInRange(startDate, endDate);
  const allSlots: TimeSlot[] = [];
  
  for (const date of dates) {
    // Пропускаем выходные
    if (!isWorkingDay(date)) {
      continue;
    }
    
    const daySlots = generateSlotsForDay(date, durationMinutes);
    allSlots.push(...daySlots);
  }
  
  // Отмечаем занятые слоты
  for (const slot of allSlots) {
    const slotStart = new Date(slot.startTime).getTime();
    const slotEnd = new Date(slot.endTime).getTime();
    
    // Проверяем пересечение с забронированными слотами
    for (const booked of bookedRanges) {
      const bookedStart = new Date(booked.startTime).getTime();
      const bookedEnd = new Date(booked.endTime).getTime();
      
      // Пересечение: (start1 < end2) && (end1 > start2)
      if (slotStart < bookedEnd && slotEnd > bookedStart) {
        slot.isAvailable = false;
        break;
      }
    }
  }
  
  return allSlots;
}

/**
 * Проверяет, находится ли дата в окне бронирования
 */
export function isWithinBookingWindow(
  startTime: Date,
  windowStart: Date,
  windowEnd: Date
): boolean {
  const time = startTime.getTime();
  return time >= windowStart.getTime() && time < windowEnd.getTime();
}
