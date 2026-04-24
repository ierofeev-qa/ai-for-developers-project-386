### Hexlet tests and linter status:
[![Actions Status](https://github.com/ierofeev-qa/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/ierofeev-qa/ai-for-developers-project-386/actions)

# Calendar Booking Application

Приложение для бронирования календаря с фронтендом и бэкендом.

## Структура проекта

```
ai-for-developers-project-386/
├── calendar-api.tsp        # TypeSpec спецификация API
├── backend/                # Backend API сервер
│   ├── src/
│   │   ├── routes/        # API роуты
│   │   ├── store/         # In-memory хранилище
│   │   ├── utils/         # Утилиты
│   │   └── types/         # TypeScript типы
│   ├── package.json
│   └── README.md
├── frontend/               # Фронтенд приложение
│   ├── src/
│   │   ├── api/           # API клиент
│   │   ├── components/    # React компоненты
│   │   ├── hooks/         # TanStack Query хуки
│   │   ├── mocks/         # Prism мок-данные
│   │   ├── pages/         # Страницы приложения
│   │   ├── providers/     # React провайдеры
│   │   └── types/         # TypeScript типы
│   ├── package.json
│   └── README.md
└── README.md              # Этот файл
```

## Быстрый старт

### Запуск полного приложения (фронтенд + бэкенд)

**Терминал 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Терминал 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

Backend API будет доступен по адресу: http://localhost:3001

### Запуск только фронтенда с мок-сервером

```bash
cd frontend
npm install
npm run dev:mock
```

## Функциональность

### Роли пользователей

**Владелец календаря:**
- Создание и управление типами событий
- Просмотр предстоящих встреч
- Отмена и перенос бронирований

**Гость:**
- Просмотр типов событий
- Бронирование слотов без регистрации
- Просмотр подтверждения бронирования

### Ограничения
- Окно бронирования: 14 дней от текущей даты
- На одно время нельзя создать две записи (даже разных типов)
- Рабочие часы: 09:00-18:00, понедельник-пятница
- Нет регистрации и авторизации

## API

API описано в файле `calendar-api.tsp` с использованием TypeSpec.

### Публичные эндпоинты
- `GET /event-types` — список типов событий
- `GET /event-types/{id}` — информация о типе события
- `GET /event-types/{id}/available-slots` — доступные слоты
- `POST /bookings` — создание бронирования
- `GET /bookings/{id}` — информация о бронировании

### Административные эндпоинты
- `POST /admin/event-types` — создание типа события
- `PATCH /admin/event-types/{id}` — обновление типа события
- `DELETE /admin/event-types/{id}` — удаление типа события
- `GET /admin/bookings` — список всех бронирований
- `GET /admin/meetings/upcoming` — предстоящие встречи
- `POST /admin/bookings/{id}/cancel` — отмена бронирования
- `POST /admin/bookings/{id}/reschedule` — перенос бронирования

## Технологии

### Backend
- Node.js 20+
- Express.js
- TypeScript
- Zod (валидация)
- nanoid (генерация ID)
- In-memory хранилище

### Фронтенд
- Vite + React + TypeScript
- Mantine (UI библиотека)
- TanStack Query (работа с API)
- Axios (HTTP клиент)
- Day.js (работа с датами)
- Prism (мокирование API)

## Особенности бэкенда

### Обработка конфликтов при бронировании

При создании бронирования (`POST /bookings`) выполняются проверки:

1. **Проверка окна бронирования** — слот должен быть в пределах 14 дней
2. **Проверка рабочих часов** — только 09:00-18:00, пн-пт
3. **Проверка конфликтов** — на одно время нельзя создать два бронирования

При конфликте возвращается ошибка `409 Conflict`:

```json
{
  "code": "TIME_CONFLICT",
  "message": "Selected time slot is already booked",
  "conflictStartTime": "2024-01-15T09:00:00.000Z",
  "conflictBookingId": "abc123"
}
```

### Хранилище данных

Данные хранятся в памяти (Map):
- После перезапуска сервера данные сбрасываются
- При старте создаются 3 типа событий (из моков)

## Документация

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Лицензия

MIT
