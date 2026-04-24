import { Router } from 'express';
import * as store from '../store/index.js';
import { createBookingSchema } from '../utils/validation.js';
import { addMinutes, getStartOfDay, addDays, isWithinBookingWindow } from '../utils/slots.js';
import { checkTimeConflict, isValidTimeSlot } from '../utils/conflicts.js';
import type { ErrorResponse, TimeConflictError, SlotNotAvailableError, Booking } from '../types/index.js';

const router = Router();

/**
 * POST /bookings
 * Создать бронирование
 * Обрабатывает конфликты при бронировании
 */
router.post('/', (req, res) => {
  // Валидируем тело запроса
  const bodyResult = createBookingSchema.safeParse(req.body);
  if (!bodyResult.success) {
    const error: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: bodyResult.error.message,
    };
    res.status(400).json(error);
    return;
  }
  
  const { eventTypeId, startTime, guest } = bodyResult.data;
  
  // Проверяем существование типа события
  const eventType = store.getEventTypeById(eventTypeId);
  if (!eventType) {
    const error: ErrorResponse = {
      code: 'NOT_FOUND',
      message: `Event type with id '${eventTypeId}' not found`,
    };
    res.status(400).json(error);
    return;
  }
  
  // Вычисляем время окончания
  const startDate = new Date(startTime);
  const endDate = addMinutes(startDate, eventType.durationMinutes);
  const endTime = endDate.toISOString();
  
  // Проверяем, что время в рабочих часах
  if (!isValidTimeSlot(startTime, eventType.durationMinutes)) {
    const error: ErrorResponse = {
      code: 'INVALID_TIME',
      message: 'Selected time is outside working hours or on a weekend',
    };
    res.status(400).json(error);
    return;
  }
  
  // Проверяем, что время в окне бронирования (14 дней)
  const today = getStartOfDay(new Date());
  const maxBookingDate = addDays(today, 14);
  
  if (!isWithinBookingWindow(startDate, today, maxBookingDate)) {
    const error: SlotNotAvailableError = {
      code: 'SLOT_NOT_AVAILABLE',
      message: 'Selected slot is not available or outside booking window',
      maxBookingDate: maxBookingDate.toISOString().split('T')[0],
    };
    res.status(409).json(error);
    return;
  }
  
  // Проверяем конфликт с существующими бронированиями
  const confirmedBookings = store.getConfirmedBookings();
  const { hasConflict, conflictingBooking } = checkTimeConflict(
    startTime,
    endTime,
    confirmedBookings
  );
  
  if (hasConflict && conflictingBooking) {
    const error: TimeConflictError = {
      code: 'TIME_CONFLICT',
      message: 'Selected time slot is already booked',
      conflictStartTime: conflictingBooking.startTime,
      conflictBookingId: conflictingBooking.id,
    };
    res.status(409).json(error);
    return;
  }
  
  // Создаем бронирование
  const booking = store.createBooking({
    eventTypeId,
    eventType,
    startTime,
    endTime,
    guest,
    status: 'confirmed',
  });
  
  res.status(201).json(booking);
});

/**
 * GET /bookings/:id
 * Получить информацию о бронировании
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const booking = store.getBookingById(id);
  
  if (!booking) {
    const error: ErrorResponse = {
      code: 'NOT_FOUND',
      message: `Booking with id '${id}' not found`,
    };
    res.status(404).json(error);
    return;
  }
  
  res.json(booking);
});

export default router;
