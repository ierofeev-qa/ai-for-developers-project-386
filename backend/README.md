# Calendar Booking Backend

API сервер для системы бронирования календаря.

## Технологии

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **IDs**: nanoid
- **Storage**: In-memory (данные сбрасываются при перезапуске)

## Установка

```bash
cd backend
npm install
```

## Запуск

### Разработка (с hot reload)
```bash
npm run dev
```

### Продакшен
```bash
npm run build
npm start
```

Сервер будет доступен на порту 3001 (или PORT из env).

## API Endpoints

### Публичные эндпоинты (для гостей)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/event-types` | Список всех типов событий |
| `GET` | `/event-types/:id` | Информация о типе события |
| `GET` | `/event-types/:id/available-slots` | Доступные слоты для бронирования |
| `POST` | `/bookings` | Создать бронирование |
| `GET` | `/bookings/:id` | Получить информацию о бронировании |

### Административные эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/admin/event-types` | Создать тип события |
| `PATCH` | `/admin/event-types/:id` | Обновить тип события |
| `DELETE` | `/admin/event-types/:id` | Удалить тип события |
| `GET` | `/admin/bookings` | Список всех бронирований |
| `GET` | `/admin/meetings/upcoming` | Предстоящие встречи |
| `POST` | `/admin/bookings/:id/cancel` | Отменить бронирование |
| `POST` | `/admin/bookings/:id/reschedule` | Перенести бронирование |

### Health Check

```bash
GET /health
```

## Особенности реализации

### Рабочие часы
- Понедельник-пятница
- 09:00 - 18:00
- Интервал слотов: 30 минут

### Окно бронирования
- 14 дней от текущей даты
- Бронирование доступно только в рабочие часы

### Обработка конфликтов
При создании бронирования (`POST /bookings`):
1. Проверяется, что слот находится в окне бронирования (14 дней)
2. Проверяется отсутствие пересечений с существующими confirmed бронированиями
3. Если есть конфликт — возвращается ошибка `409`:

```json
{
  "code": "TIME_CONFLICT",
  "message": "Selected time slot is already booked",
  "conflictStartTime": "2024-01-15T09:00:00.000Z",
  "conflictBookingId": "abc123"
}
```

### Стартовые данные
При запуске сервера создаются 3 типа событий:
- Консультация (30 мин)
- Встреча (60 мин)
- Тренинг (120 мин)

## Тестирование

```bash
# Запуск тестов API (требуется запущенный сервер)
npm run test:api
```

## Примеры запросов

### Получить доступные слоты
```bash
curl http://localhost:3001/event-types/1/available-slots
```

### Создать бронирование
```bash
curl -X POST http://localhost:3001/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "eventTypeId": "1",
    "startTime": "2024-01-15T09:00:00.000Z",
    "guest": {
      "name": "Иван Иванов",
      "email": "ivan@example.com",
      "phone": "+79991234567"
    }
  }'
```

### Получить предстоящие встречи (админ)
```bash
curl http://localhost:3001/admin/meetings/upcoming
```

## Интеграция с фронтендом

Фронтенд настроен на проксирование запросов с `/api` на `http://localhost:3001`.
Пример конфигурации Vite (уже настроено):

```javascript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

## Лицензия

MIT
