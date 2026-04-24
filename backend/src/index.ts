import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import eventTypesRouter from './routes/eventTypes.js';
import bookingsRouter from './routes/bookings.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (must be before static files)
app.use('/api/event-types', eventTypesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from frontend build
const staticPath = path.join(process.cwd(), 'frontend/dist');
app.use(express.static(staticPath));

// SPA fallback: serve index.html for all non-API routes
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
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
  console.log(`🚀 Calendar Booking server running on port ${PORT}`);
  console.log(`📅 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API endpoints:`);
  console.log(`  - GET  /api/event-types`);
  console.log(`  - GET  /api/event-types/:id`);
  console.log(`  - GET  /api/event-types/:id/available-slots`);
  console.log(`  - POST /api/bookings`);
  console.log(`  - GET  /api/bookings/:id`);
  console.log(`  - POST /api/admin/event-types`);
  console.log(`  - PATCH /api/admin/event-types/:id`);
  console.log(`  - DELETE /api/admin/event-types/:id`);
  console.log(`  - GET  /api/admin/bookings`);
  console.log(`  - GET  /api/admin/meetings/upcoming`);
  console.log(`  - POST /api/admin/bookings/:id/cancel`);
  console.log(`  - POST /api/admin/bookings/:id/reschedule`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
});
