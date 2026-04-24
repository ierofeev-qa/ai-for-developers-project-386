import { Router } from 'express';
import * as store from '../store/index.js';
import { createEventTypeSchema, updateEventTypeSchema, bookingsQuerySchema, rescheduleSchema } from '../utils/validation.js';
import { checkTimeConflict, isValidTimeSlot } from '../utils/conflicts.js';
import { addMinutes } from '../utils/slots.js';
import type { ErrorResponse, TimeConflictError, UpcomingMeetingsResponse, UpcomingMeeting } from '../types/index.js';

const router = Router();

// ==========================================
// УПРАВЛЕНИЕ ТИПАМИ СОБЫТИЙ
// ==========================================

/**
 * POST /admin/event-types
 * Создать новый тип события
 */
router.post('/event-types', (req, res) => {
  const bodyResult = createEventTypeSchema.safeParse(req.body);
  if (!bodyResult.success) {
    const error: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: bodyResult.error.message,
    };
    res.status(400).json(error);
    return;
  }
  
  const eventType = store.createEventType(bodyResult.data);
  res.status(201).json(eventType);
});

/**
 * PATCH /admin/event-types/:id
 * Обновить тип события
 */
router.patch('/event-types/:id', (req, res) => {
  const { id } = req.params;
  
  const bodyResult = updateEventTypeSchema.safeParse(req.body);
  if (!bodyResult.success) {
    const error: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: bodyResult.error.message,
    };
    res.status(400).json(error);
    return;
  }
  
  const eventType = store.updateEventType(id, bodyResult.data);
  if (!eventType) {
    const error: ErrorResponse = {
      code: 'NOT_FOUND',
      message: `Event type with id '${id}' not found`,
    };
    res.status(404).json(error);
    return;
  }
  
  res.json(eventType);
});

/**
 * DELETE /admin/event-types/:id
 * Удалить тип события
 */
router.delete('/event-types/:id', (req, res) => {
  const { id } = req.params;
  
  // Проверяем существование
  if (!store.getEventTypeById(id)) {
    const error: ErrorResponse = {
      code: 'NOT_FOUND',
      message: `Event type with id '${id}' not found`,
    };
    res.status(404).json(error);
    return;
  }
  
  // Проверяем, есть ли активные бронирования
  const hasBookings = store.getConfirmedBookings().some((b) => b.eventTypeId === id);
  if (hasBookings) {
    const error: ErrorResponse = {
      code: 'CONFLICT',
      message: 'Cannot delete event type with existing bookings',
    };
    res.status(409).json(error);
    return;
  }
  
  store.deleteEventType(id);
  res.status(204).send();
});

// ==========================================
// УПРАВЛЕНИЕ БРОНИРОВАНИЯМИ
// ==========================================

/**
 * GET /admin/bookings
 * Получить список всех бронирований
 */
router.get('/bookings', (req, res) => {
  const queryResult = bookingsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    const error: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid query parameters',
      details: queryResult.error.message,
    };
    res.status(400).json(error);
    return;
  }
  
  const { status, fromDate, toDate } = queryResult.data;
  
  const bookings = store.getBookingsByFilters({
    status,
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
  });
  
  res.json(bookings);
});

/**
 * GET /admin/meetings/upcoming
 * Получить предстоящие встречи
 */
router.get('/meetings/upcoming', (req, res) => {
  const queryResult = bookingsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    const error: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid query parameters',
      details: queryResult.error.message,
    };
    res.status(400).json(error);
    return;
  }
  
  const { status, fromDate, toDate } = queryResult.data;
  
  let meetings = store.getUpcomingMeetings();
  
  if (status) {
    meetings = meetings.filter((m) => m.status === status);
  }
  
  if (fromDate) {
    const fromTime = new Date(fromDate).getTime();
    meetings = meetings.filter((m) => new Date(m.startTime).getTime() >= fromTime);
  }
  
  if (toDate) {
    const toTime = new Date(toDate).getTime();
    meetings = meetings.filter((m) => new Date(m.startTime).getTime() <= toTime);
  }
  
  const response: UpcomingMeetingsResponse = {
    total: meetings.length,
    meetings,
  };
  
  res.json(response);
});

/**
 * POST /admin/bookings/:id/cancel
 * Отменить бронирование
 */
router.post('/bookings/:id/cancel', (req, res) => {
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
  
  if (booking.status === 'cancelled') {
    const error: ErrorResponse = {
      code: 'ALREADY_CANCELLED',
      message: 'Booking is already cancelled',
    };
    res.status(400).json(error);
    return;
  }
  
  const cancelled = store.updateBookingStatus(id, 'cancelled');
  res.json(cancelled);
});

/**
 * POST /admin/bookings/:id/reschedule
 * Перенести бронирование на другое время
 */
router.post('/bookings/:id/reschedule', (req, res) => {
  const { id } = req.params;
  
  // Валидируем тело запроса
  const bodyResult = rescheduleSchema.safeParse(req.body);
  if (!bodyResult.success) {
    const error: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: bodyResult.error.message,
    };
    res.status(400).json(error);
    return;
  }
  
  const { newStartTime } = bodyResult.data;
  
  // Проверяем существование бронирования
  const booking = store.getBookingById(id);
  if (!booking) {
    const error: ErrorResponse = {
      code: 'NOT_FOUND',
      message: `Booking with id '${id}' not found`,
    };
    res.status(404).json(error);
    return;
  }
  
  if (booking.status === 'cancelled') {
    const error: ErrorResponse = {
      code: 'ALREADY_CANCELLED',
      message: 'Cannot reschedule cancelled booking',
    };
    res.status(400).json(error);
    return;
  }
  
  // Вычисляем новое время окончания
  const newStart = new Date(newStartTime);
  const newEnd = addMinutes(newStart, booking.eventType.durationMinutes);
  const newEndTime = newEnd.toISOString();
  
  // Проверяем валидность времени
  if (!isValidTimeSlot(newStartTime, booking.eventType.durationMinutes)) {
    const error: ErrorResponse = {
      code: 'INVALID_TIME',
      message: 'Selected time is outside working hours or on a weekend',
    };
    res.status(400).json(error);
    return;
  }
  
  // Проверяем конфликт с другими бронированиями
  const confirmedBookings = store.getConfirmedBookings();
  const { hasConflict, conflictingBooking } = checkTimeConflict(
    newStartTime,
    newEndTime,
    confirmedBookings,
    id // Исключаем текущее бронирование
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
  
  // Обновляем бронирование
  const updated = store.updateBookingTime(id, newStartTime, newEndTime);
  res.json(updated);
});

export default router;
