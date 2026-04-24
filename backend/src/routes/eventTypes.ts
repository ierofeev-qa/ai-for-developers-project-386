import { Router } from 'express';
import { z } from 'zod';
import * as store from '../store/index.js';
import { generateAvailableSlots, getStartOfDay, addDays, isWithinBookingWindow } from '../utils/slots.js';
import { checkTimeConflict, isValidTimeSlot } from '../utils/conflicts.js';
import { availableSlotsQuerySchema } from '../utils/validation.js';
import type { ErrorResponse } from '../types/index.js';

const router = Router();

/**
 * GET /event-types
 * Получить список всех типов событий
 */
router.get('/', (req, res) => {
  const eventTypes = store.getAllEventTypes();
  res.json(eventTypes);
});

/**
 * GET /event-types/:id
 * Получить информацию о конкретном типе события
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const eventType = store.getEventTypeById(id);
  
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
 * GET /event-types/:eventTypeId/available-slots
 * Получить доступные слоты для бронирования
 */
router.get('/:eventTypeId/available-slots', (req, res) => {
  const { eventTypeId } = req.params;
  
  // Проверяем существование типа события
  const eventType = store.getEventTypeById(eventTypeId);
  if (!eventType) {
    const error: ErrorResponse = {
      code: 'NOT_FOUND',
      message: `Event type with id '${eventTypeId}' not found`,
    };
    res.status(404).json(error);
    return;
  }
  
  // Валидируем query параметры
  const queryResult = availableSlotsQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    const error: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid query parameters',
      details: queryResult.error.message,
    };
    res.status(400).json(error);
    return;
  }
  
  const { startDate, days } = queryResult.data;
  
  // Определяем начало окна бронирования
  const windowStart = startDate 
    ? new Date(startDate)
    : getStartOfDay(new Date());
  
  // Получаем подтвержденные бронирования
  const confirmedBookings = store.getConfirmedBookings();
  const bookedRanges = confirmedBookings.map((b) => ({
    startTime: b.startTime,
    endTime: b.endTime,
  }));
  
  // Генерируем слоты
  const slots = generateAvailableSlots(
    windowStart,
    days,
    eventType.durationMinutes,
    bookedRanges
  );
  
  const windowEnd = addDays(windowStart, days);
  
  res.json({
    eventTypeId,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    slots,
  });
});

export default router;
