/**
 * TypeScript типы для Calendar Booking API
 * На основе TypeSpec спецификации (calendar-api.tsp)
 */

/**
 * Тип события, создаваемый владельцем календаря
 */
export interface EventType {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
}

/**
 * Данные для создания типа события
 */
export interface CreateEventTypeRequest {
  name: string;
  description?: string;
  durationMinutes: number;
}

/**
 * Данные для обновления типа события
 */
export interface UpdateEventTypeRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
}

/**
 * Информация о госте (без регистрации)
 */
export interface GuestInfo {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

/**
 * Статус бронирования
 */
export type BookingStatus = 'confirmed' | 'cancelled';

/**
 * Бронирование (встреча)
 */
export interface Booking {
  id: string;
  eventTypeId: string;
  eventType: EventType;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  guest: GuestInfo;
  status: BookingStatus;
  createdAt: string; // ISO 8601 format
}

/**
 * Данные для создания бронирования
 */
export interface CreateBookingRequest {
  eventTypeId: string;
  startTime: string; // ISO 8601 format
  guest: GuestInfo;
}

/**
 * Слот для бронирования
 */
export interface TimeSlot {
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  isAvailable: boolean;
}

/**
 * Доступные слоты для конкретного типа события
 */
export interface AvailableSlotsResponse {
  eventTypeId: string;
  windowStart: string; // ISO 8601 format
  windowEnd: string; // ISO 8601 format
  slots: TimeSlot[];
}

/**
 * Предстоящая встреча (для админки владельца)
 */
export interface UpcomingMeeting {
  id: string;
  eventType: EventType;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  guest: GuestInfo;
  status: BookingStatus;
}

/**
 * Список предстоящих встреч
 */
export interface UpcomingMeetingsResponse {
  total: number;
  meetings: UpcomingMeeting[];
}

/**
 * Стандартная ошибка API
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

/**
 * Ошибка конфликта времени
 */
export interface TimeConflictError extends ErrorResponse {
  code: 'TIME_CONFLICT';
  message: 'Selected time slot is already booked';
  conflictStartTime: string;
  conflictBookingId?: string;
}

/**
 * Ошибка недоступности слота
 */
export interface SlotNotAvailableError extends ErrorResponse {
  code: 'SLOT_NOT_AVAILABLE';
  message: 'Selected slot is not available or outside booking window';
  maxBookingDate: string;
}
