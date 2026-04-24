# Calendar Booking Application

Приложение для бронирования календаря с фронтендом и бэкендом.

## Структура проекта

```
ai-for-developers-project-386/
├── calendar-api.tsp        # TypeSpec спецификация API
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

### Запуск фронтенда с мок-сервером

```bash
cd frontend
npm install
npm run dev:mock
```

Приложение будет доступно по адресу: http://localhost:5173

Мок-сервер API будет доступен по адресу: http://localhost:3001

## Функциональность

### Роли пользователей

**Владелец календаря:**
- Создание и управление типами событий
- Просмотр предстоящих встреч
- Отмена бронирований

**Гость:**
- Просмотр типов событий
- Бронирование слотов без регистрации
- Просмотр подтверждения бронирования

### Ограничения
- Окно бронирования: 14 дней от текущей даты
- На одно время нельзя создать две записи (даже разных типов)
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

## Технологии

### Фронтенд
- Vite + React + TypeScript
- Mantine (UI библиотека)
- TanStack Query (работа с API)
- Axios (HTTP клиент)
- Day.js (работа с датами)
- Prism (мокирование API)

## Лицензия

MIT
