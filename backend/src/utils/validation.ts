import { z } from 'zod';

// EventType schemas
export const createEventTypeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  durationMinutes: z.number().int().min(1).max(480),
});

export const updateEventTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  durationMinutes: z.number().int().min(1).max(480).optional(),
});

// GuestInfo schema
export const guestInfoSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

// CreateBooking schema
export const createBookingSchema = z.object({
  eventTypeId: z.string(),
  startTime: z.string().datetime(),
  guest: guestInfoSchema,
});

// Query params schemas
export const availableSlotsQuerySchema = z.object({
  startDate: z.string().date().optional(),
  days: z.coerce.number().int().min(1).max(14).default(14),
});

export const bookingsQuerySchema = z.object({
  status: z.enum(['confirmed', 'cancelled']).optional(),
  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional(),
});

// Reschedule schema
export const rescheduleSchema = z.object({
  newStartTime: z.string().datetime(),
});

// Types inferred from schemas
export type CreateEventTypeInput = z.infer<typeof createEventTypeSchema>;
export type UpdateEventTypeInput = z.infer<typeof updateEventTypeSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type AvailableSlotsQuery = z.infer<typeof availableSlotsQuerySchema>;
export type BookingsQuery = z.infer<typeof bookingsQuerySchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;
