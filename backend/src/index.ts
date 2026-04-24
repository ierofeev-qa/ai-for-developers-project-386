import express from 'express';
import cors from 'cors';
import eventTypesRouter from './routes/eventTypes.js';
import bookingsRouter from './routes/bookings.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/event-types', eventTypesRouter);
app.use('/bookings', bookingsRouter);
app.use('/admin', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Calendar Booking API server running on port ${PORT}`);
  console.log(`📅 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API endpoints:`);
  console.log(`  - GET  /event-types`);
  console.log(`  - GET  /event-types/:id`);
  console.log(`  - GET  /event-types/:id/available-slots`);
  console.log(`  - POST /bookings`);
  console.log(`  - GET  /bookings/:id`);
  console.log(`  - POST /admin/event-types`);
  console.log(`  - PATCH /admin/event-types/:id`);
  console.log(`  - DELETE /admin/event-types/:id`);
  console.log(`  - GET  /admin/bookings`);
  console.log(`  - GET  /admin/meetings/upcoming`);
  console.log(`  - POST /admin/bookings/:id/cancel`);
  console.log(`  - POST /admin/bookings/:id/reschedule`);
});
