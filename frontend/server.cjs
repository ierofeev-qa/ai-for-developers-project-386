const jsonServer = require('json-server')
const dayjs = require('dayjs')

const server = jsonServer.create()
const router = jsonServer.router('src/mocks/db.json')
const middlewares = jsonServer.defaults()

// Middleware для парсинга JSON
server.use(middlewares)
server.use(jsonServer.bodyParser)

// ==========================================
// ПУБЛИЧНЫЕ ЭНДПОИНТЫ
// ==========================================

// GET /event-types - список типов событий
server.get('/event-types', (req, res) => {
  const db = router.db
  const eventTypes = db.get('event-types').value()
  res.json(eventTypes)
})

// GET /event-types/:id - получить тип события
server.get('/event-types/:id', (req, res) => {
  const db = router.db
  const eventType = db.get('event-types').find({ id: req.params.id }).value()
  if (!eventType) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Event type not found' })
  }
  res.json(eventType)
})

// GET /event-types/:eventTypeId/available-slots - доступные слоты
server.get('/event-types/:eventTypeId/available-slots', (req, res) => {
  const db = router.db
  const eventType = db.get('event-types').find({ id: req.params.eventTypeId }).value()

  if (!eventType) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Event type not found' })
  }

  const startDate = req.query.startDate ? dayjs(req.query.startDate) : dayjs()
  const days = parseInt(req.query.days) || 14

  const windowStart = startDate.startOf('day').toISOString()
  const windowEnd = startDate.add(days, 'day').endOf('day').toISOString()

  // Получаем существующие бронирования
  const bookings = db.get('bookings').value()

  // Генерируем слоты (9:00 - 18:00, каждые 30 мин)
  const slots = []
  for (let d = 0; d < days; d++) {
    const date = startDate.add(d, 'day')
    const dayOfWeek = date.day()

    // Пропускаем выходные (0 = воскресенье, 6 = суббота)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = date.hour(hour).minute(minute).second(0)
        const slotEnd = slotStart.add(eventType.durationMinutes, 'minute')

        // Проверяем, не занят ли слот
        const isBooked = bookings.some(booking => {
          const bookingStart = dayjs(booking.startTime)
          const bookingEnd = dayjs(booking.endTime)
          return slotStart.isBefore(bookingEnd) && slotEnd.isAfter(bookingStart)
        })

        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable: !isBooked
        })
      }
    }
  }

  res.json({
    eventTypeId: req.params.eventTypeId,
    windowStart,
    windowEnd,
    slots
  })
})

// POST /bookings - создать бронирование
server.post('/bookings', (req, res) => {
  const db = router.db
  const { eventTypeId, startTime, guest } = req.body

  // Проверяем существование типа события
  const eventType = db.get('event-types').find({ id: eventTypeId }).value()
  if (!eventType) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Event type not found' })
  }

  // Проверяем, не занят ли слот
  const bookingStart = dayjs(startTime)
  const bookingEnd = bookingStart.add(eventType.durationMinutes, 'minute')
  const bookings = db.get('bookings').value()

  const conflict = bookings.find(booking => {
    const existingStart = dayjs(booking.startTime)
    const existingEnd = dayjs(booking.endTime)
    return bookingStart.isBefore(existingEnd) && bookingEnd.isAfter(existingStart)
  })

  if (conflict) {
    return res.status(409).json({
      code: 'TIME_CONFLICT',
      message: 'Selected time slot is already booked',
      conflictStartTime: conflict.startTime,
      conflictBookingId: conflict.id
    })
  }

  // Проверяем окно бронирования (14 дней)
  const now = dayjs()
  const maxDate = now.add(14, 'day')
  if (bookingStart.isAfter(maxDate)) {
    return res.status(409).json({
      code: 'SLOT_NOT_AVAILABLE',
      message: 'Selected slot is not available or outside booking window',
      maxBookingDate: maxDate.format('YYYY-MM-DD')
    })
  }

  // Создаем бронирование
  const booking = {
    id: 'booking-' + Date.now(),
    eventTypeId,
    eventType,
    startTime: bookingStart.toISOString(),
    endTime: bookingEnd.toISOString(),
    guest,
    status: 'confirmed',
    createdAt: dayjs().toISOString()
  }

  db.get('bookings').push(booking).write()

  res.status(201).json(booking)
})

// GET /bookings/:id - получить бронирование
server.get('/bookings/:id', (req, res) => {
  const db = router.db
  const booking = db.get('bookings').find({ id: req.params.id }).value()

  if (!booking) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Booking not found' })
  }

  res.json(booking)
})

// ==========================================
// АДМИН ЭНДПОИНТЫ
// ==========================================

// POST /admin/event-types - создать тип события
server.post('/admin/event-types', (req, res) => {
  const db = router.db
  const { name, description, durationMinutes } = req.body

  if (!name || !durationMinutes) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Name and durationMinutes are required' })
  }

  const eventType = {
    id: String(Date.now()),
    name,
    description,
    durationMinutes
  }

  db.get('event-types').push(eventType).write()
  res.status(201).json(eventType)
})

// PATCH /admin/event-types/:id - обновить тип события
server.patch('/admin/event-types/:id', (req, res) => {
  const db = router.db
  const eventType = db.get('event-types').find({ id: req.params.id })

  if (!eventType.value()) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Event type not found' })
  }

  eventType.assign(req.body).write()
  res.json(eventType.value())
})

// DELETE /admin/event-types/:id - удалить тип события
server.delete('/admin/event-types/:id', (req, res) => {
  const db = router.db
  const eventType = db.get('event-types').find({ id: req.params.id })

  if (!eventType.value()) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Event type not found' })
  }

  // Проверяем, есть ли бронирования этого типа
  const bookings = db.get('bookings').filter({ eventTypeId: req.params.id }).value()
  if (bookings.length > 0) {
    return res.status(409).json({ code: 'CONFLICT', message: 'Cannot delete event type with existing bookings' })
  }

  db.get('event-types').remove({ id: req.params.id }).write()
  res.status(204).send()
})

// GET /admin/bookings - список всех бронирований
server.get('/admin/bookings', (req, res) => {
  const db = router.db
  let bookings = db.get('bookings').value()

  if (req.query.status) {
    bookings = bookings.filter(b => b.status === req.query.status)
  }

  res.json(bookings)
})

// GET /admin/meetings/upcoming - предстоящие встречи
server.get('/admin/meetings/upcoming', (req, res) => {
  const db = router.db
  let meetings = db.get('bookings')
    .filter(b => dayjs(b.startTime).isAfter(dayjs()))
    .orderBy(['startTime'], ['asc'])
    .value()

  if (req.query.status) {
    meetings = meetings.filter(m => m.status === req.query.status)
  }

  res.json({
    total: meetings.length,
    meetings
  })
})

// POST /admin/bookings/:id/cancel - отменить бронирование
server.post('/admin/bookings/:id/cancel', (req, res) => {
  const db = router.db
  const booking = db.get('bookings').find({ id: req.params.id })

  if (!booking.value()) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Booking not found' })
  }

  booking.assign({ status: 'cancelled' }).write()
  res.json(booking.value())
})

// Роутер для остальных запросов
server.use(router)

// Запуск сервера
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`)
})
