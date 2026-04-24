import axios, { AxiosError } from 'axios';
import type { 
  EventType, 
  CreateEventTypeRequest, 
  UpdateEventTypeRequest,
  Booking, 
  CreateBookingRequest, 
  AvailableSlotsResponse, 
  UpcomingMeetingsResponse,
  ErrorResponse 
} from '../types';

// Базовый URL API (можно вынести в .env)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Для разработки с Vite proxy используем относительный путь
const getBaseUrl = () => {
  // Если используется Vite dev server с proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  return API_BASE_URL;
};

// Создание экземпляра axios
export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Здесь можно добавить глобальную обработку ошибок
    return Promise.reject(error);
  }
);

// ==========================================
// ПУБЛИЧНЫЕ ЭНДПОИНТЫ (для гостей)
// ==========================================

/**
 * Получить список всех типов событий
 */
export const getEventTypes = async (): Promise<EventType[]> => {
  const response = await apiClient.get<EventType[]>('/event-types');
  return response.data;
};

/**
 * Получить информацию о конкретном типе события
 */
export const getEventType = async (id: string): Promise<EventType> => {
  const response = await apiClient.get<EventType>(`/event-types/${id}`);
  return response.data;
};

/**
 * Получить доступные слоты для бронирования
 */
export const getAvailableSlots = async (
  eventTypeId: string,
  startDate?: string,
  days: number = 14
): Promise<AvailableSlotsResponse> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  params.append('days', days.toString());
  
  const response = await apiClient.get<AvailableSlotsResponse>(
    `/event-types/${eventTypeId}/available-slots?${params.toString()}`
  );
  return response.data;
};

/**
 * Создать бронирование
 */
export const createBooking = async (booking: CreateBookingRequest): Promise<Booking> => {
  const response = await apiClient.post<Booking>('/bookings', booking);
  return response.data;
};

/**
 * Получить информацию о бронировании
 */
export const getBooking = async (id: string): Promise<Booking> => {
  const response = await apiClient.get<Booking>(`/bookings/${id}`);
  return response.data;
};

// ==========================================
// АДМИНИСТРАТИВНЫЕ ЭНДПОИНТЫ (для владельца)
// ==========================================

/**
 * Создать новый тип события
 */
export const createEventType = async (eventType: CreateEventTypeRequest): Promise<EventType> => {
  const response = await apiClient.post<EventType>('/admin/event-types', eventType);
  return response.data;
};

/**
 * Обновить тип события
 */
export const updateEventType = async (
  id: string, 
  eventType: UpdateEventTypeRequest
): Promise<EventType> => {
  const response = await apiClient.patch<EventType>(`/admin/event-types/${id}`, eventType);
  return response.data;
};

/**
 * Удалить тип события
 */
export const deleteEventType = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/event-types/${id}`);
};

/**
 * Получить список всех бронирований (для админа)
 */
export const getAllBookings = async (params?: {
  status?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<Booking[]> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  
  const response = await apiClient.get<Booking[]>(`/admin/bookings?${searchParams.toString()}`);
  return response.data;
};

/**
 * Получить предстоящие встречи
 */
export const getUpcomingMeetings = async (params?: {
  status?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<UpcomingMeetingsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.fromDate) searchParams.append('fromDate', params.fromDate);
  if (params?.toDate) searchParams.append('toDate', params.toDate);
  
  const response = await apiClient.get<UpcomingMeetingsResponse>(
    `/admin/meetings/upcoming?${searchParams.toString()}`
  );
  return response.data;
};

/**
 * Отменить бронирование (админ)
 */
export const cancelBooking = async (id: string): Promise<Booking> => {
  const response = await apiClient.post<Booking>(`/admin/bookings/${id}/cancel`);
  return response.data;
};

/**
 * Перенести бронирование на другое время
 */
export const rescheduleBooking = async (
  id: string, 
  newStartTime: string
): Promise<Booking> => {
  const response = await apiClient.post<Booking>(`/admin/bookings/${id}/reschedule`, {
    newStartTime,
  });
  return response.data;
};
