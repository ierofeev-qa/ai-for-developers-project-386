import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEventTypes,
  getEventType,
  getAvailableSlots,
  createBooking,
  getBooking,
  createEventType,
  updateEventType,
  deleteEventType,
  getAllBookings,
  getUpcomingMeetings,
  cancelBooking,
} from '../api/client';
import type { 
  CreateBookingRequest, 
  CreateEventTypeRequest, 
  UpdateEventTypeRequest 
} from '../types';

// ==========================================
// КЛЮЧИ ДЛЯ КЕША
// ==========================================

export const queryKeys = {
  eventTypes: 'eventTypes',
  eventType: (id: string) => ['eventType', id],
  availableSlots: (eventTypeId: string, startDate?: string) => 
    ['availableSlots', eventTypeId, startDate],
  booking: (id: string) => ['booking', id],
  bookings: 'bookings',
  upcomingMeetings: 'upcomingMeetings',
};

// ==========================================
// ХУКИ ДЛЯ ГОСТЕЙ
// ==========================================

/**
 * Получить список всех типов событий
 */
export const useEventTypes = () => {
  return useQuery({
    queryKey: [queryKeys.eventTypes],
    queryFn: getEventTypes,
  });
};

/**
 * Получить информацию о конкретном типе события
 */
export const useEventType = (id: string) => {
  return useQuery({
    queryKey: queryKeys.eventType(id),
    queryFn: () => getEventType(id),
    enabled: !!id,
  });
};

/**
 * Получить доступные слоты для бронирования
 */
export const useAvailableSlots = (eventTypeId: string, startDate?: string) => {
  return useQuery({
    queryKey: queryKeys.availableSlots(eventTypeId, startDate),
    queryFn: () => getAvailableSlots(eventTypeId, startDate),
    enabled: !!eventTypeId,
  });
};

/**
 * Создать бронирование
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (booking: CreateBookingRequest) => createBooking(booking),
    onSuccess: () => {
      // Инвалидируем кеш доступных слотов после успешного бронирования
      queryClient.invalidateQueries({ queryKey: [queryKeys.availableSlots] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.bookings] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.upcomingMeetings] });
    },
  });
};

/**
 * Получить информацию о бронировании
 */
export const useBooking = (id: string) => {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => getBooking(id),
    enabled: !!id,
  });
};

// ==========================================
// ХУКИ ДЛЯ АДМИНА
// ==========================================

/**
 * Получить список всех бронирований
 */
export const useAllBookings = (filters?: { status?: string; fromDate?: string; toDate?: string }) => {
  return useQuery({
    queryKey: [queryKeys.bookings, filters],
    queryFn: () => getAllBookings(filters),
  });
};

/**
 * Получить предстоящие встречи
 */
export const useUpcomingMeetings = (filters?: { status?: string; fromDate?: string; toDate?: string }) => {
  return useQuery({
    queryKey: [queryKeys.upcomingMeetings, filters],
    queryFn: () => getUpcomingMeetings(filters),
  });
};

/**
 * Создать новый тип события
 */
export const useCreateEventType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventType: CreateEventTypeRequest) => createEventType(eventType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.eventTypes] });
    },
  });
};

/**
 * Обновить тип события
 */
export const useUpdateEventType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventTypeRequest }) => 
      updateEventType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.eventTypes] });
      queryClient.invalidateQueries({ queryKey: queryKeys.eventType(variables.id) });
    },
  });
};

/**
 * Удалить тип события
 */
export const useDeleteEventType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.eventTypes] });
    },
  });
};

/**
 * Отменить бронирование
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(id) });
      queryClient.invalidateQueries({ queryKey: [queryKeys.bookings] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.upcomingMeetings] });
    },
  });
};
