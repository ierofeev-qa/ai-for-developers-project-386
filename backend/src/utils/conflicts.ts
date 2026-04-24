import type { Booking } from '../types/index.js';

/**
 * Проверяет, пересекаются ли два временных интервала
 * Пересечение: (start1 < end2) && (end1 > start2)
 */
export function hasTimeConflict(
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  
  return s1 < e2 && e1 > s2;
}

/**
 * Находит конфликтующее бронирование
 * Проверяются только подтвержденные бронирования
 */
export function findConflictingBooking(
  startTime: string,
  endTime: string,
  bookings: Booking[],
  excludeBookingId?: string
): Booking | undefined {
  return bookings.find(
    (booking) =>
      booking.status === 'confirmed' &&
      booking.id !== excludeBookingId &&
      hasTimeConflict(startTime, endTime, booking.startTime, booking.endTime)
  );
}

/**
 * Проверяет, есть ли конфликт с существующими бронированиями
 */
export function checkTimeConflict(
  startTime: string,
  endTime: string,
  bookings: Booking[],
  excludeBookingId?: string
): { hasConflict: boolean; conflictingBooking?: Booking } {
  const conflictingBooking = findConflictingBooking(
    startTime,
    endTime,
    bookings,
    excludeBookingId
  );
  
  return {
    hasConflict: !!conflictingBooking,
    conflictingBooking,
  };
}

/**
 * Проверяет, является ли слот допустимым (по рабочим часам и дням)
 */
export function isValidTimeSlot(startTime: string | Date, durationMinutes: number): boolean {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  
  const startHour = start.getHours();
  const startMinutes = start.getMinutes();
  const endHour = end.getHours();
  const endMinutes = end.getMinutes();
  
  // Рабочие часы: 09:00 - 18:00
  const isValidStart = startHour >= 9 && (startHour < 18 || (startHour === 18 && startMinutes === 0));
  const isValidEnd = endHour > 9 || (endHour === 9 && endMinutes > 0);
  const isWithinWorkingDay = endHour <= 18 || (endHour === 18 && endMinutes === 0);
  
  const dayOfWeek = start.getDay();
  const isWorkingDay = dayOfWeek !== 0 && dayOfWeek !== 6;
  
  return isWorkingDay && isValidStart && isValidEnd && isWithinWorkingDay;
}
