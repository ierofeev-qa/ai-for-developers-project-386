import { nanoid } from 'nanoid';
import type { EventType, Booking, BookingStatus } from '../types/index.js';

// In-memory storage
const eventTypes: Map<string, EventType> = new Map();
const bookings: Map<string, Booking> = new Map();

// Инициализация стартовыми данными
function initializeData(): void {
  // Стартовые типы событий (из моков)
  const initialEventTypes: EventType[] = [
    {
      id: '1',
      name: 'Консультация',
      description: 'Индивидуальная консультация по любым вопросам',
      durationMinutes: 30,
    },
    {
      id: '2',
      name: 'Встреча',
      description: 'Деловая встреча',
      durationMinutes: 60,
    },
    {
      id: '3',
      name: 'Тренинг',
      description: 'Групповой тренинг до 10 человек',
      durationMinutes: 120,
    },
  ];
  
  for (const et of initialEventTypes) {
    eventTypes.set(et.id, et);
  }
}

// Вызываем инициализацию
initializeData();

// EventType operations
export function getAllEventTypes(): EventType[] {
  return Array.from(eventTypes.values());
}

export function getEventTypeById(id: string): EventType | undefined {
  return eventTypes.get(id);
}

export function createEventType(eventType: Omit<EventType, 'id'>): EventType {
  const newEventType: EventType = {
    ...eventType,
    id: nanoid(),
  };
  eventTypes.set(newEventType.id, newEventType);
  return newEventType;
}

export function updateEventType(
  id: string,
  updates: Partial<EventType>
): EventType | undefined {
  const existing = eventTypes.get(id);
  if (!existing) return undefined;
  
  const updated: EventType = {
    ...existing,
    ...updates,
    id: existing.id, // ID нельзя изменить
  };
  eventTypes.set(id, updated);
  return updated;
}

export function deleteEventType(id: string): boolean {
  return eventTypes.delete(id);
}

export function eventTypeExists(id: string): boolean {
  return eventTypes.has(id);
}

// Booking operations
export function getAllBookings(): Booking[] {
  return Array.from(bookings.values());
}

export function getBookingById(id: string): Booking | undefined {
  return bookings.get(id);
}

export function createBooking(
  bookingData: Omit<Booking, 'id' | 'createdAt'>
): Booking {
  const newBooking: Booking = {
    ...bookingData,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  };
  bookings.set(newBooking.id, newBooking);
  return newBooking;
}

export function updateBookingStatus(
  id: string,
  status: BookingStatus
): Booking | undefined {
  const existing = bookings.get(id);
  if (!existing) return undefined;
  
  const updated: Booking = {
    ...existing,
    status,
  };
  bookings.set(id, updated);
  return updated;
}

export function updateBookingTime(
  id: string,
  startTime: string,
  endTime: string
): Booking | undefined {
  const existing = bookings.get(id);
  if (!existing) return undefined;
  
  const updated: Booking = {
    ...existing,
    startTime,
    endTime,
  };
  bookings.set(id, updated);
  return updated;
}

export function deleteBooking(id: string): boolean {
  return bookings.delete(id);
}

// Filtered queries
export function getBookingsByEventTypeId(eventTypeId: string): Booking[] {
  return getAllBookings().filter((b) => b.eventTypeId === eventTypeId);
}

export function getConfirmedBookings(): Booking[] {
  return getAllBookings().filter((b) => b.status === 'confirmed');
}

export function getBookingsByFilters(filters: {
  status?: BookingStatus;
  fromDate?: Date;
  toDate?: Date;
}): Booking[] {
  let result = getAllBookings();
  
  if (filters.status) {
    result = result.filter((b) => b.status === filters.status);
  }
  
  if (filters.fromDate) {
    const fromTime = filters.fromDate.getTime();
    result = result.filter((b) => new Date(b.startTime).getTime() >= fromTime);
  }
  
  if (filters.toDate) {
    const toTime = filters.toDate.getTime();
    result = result.filter((b) => new Date(b.startTime).getTime() <= toTime);
  }
  
  return result;
}

export function getUpcomingMeetings(): Booking[] {
  const now = new Date().getTime();
  return getConfirmedBookings()
    .filter((b) => new Date(b.startTime).getTime() >= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}
