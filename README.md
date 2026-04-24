### Hexlet tests and linter status:
[![Actions Status](https://github.com/ierofeev-qa/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/ierofeev-qa/ai-for-developers-project-386/actions)

## 🚀 Развёрнутое приложение

**Публичная ссылка:** [https://calendar-booking.onrender.com](https://calendar-booking.onrender.com)

Приложение развёрнуто на Render.com (Frankfurt, EU) с использованием Docker.

### Технологии
- **Frontend:** React 19 + TypeScript + Vite + Mantine
- **Backend:** Express.js + TypeScript + Zod
- **Deployment:** Docker + Render.com

### Архитектура
- Единый Docker-контейнер с frontend (static) + backend (API)
- Backend раздаёт статические файлы frontend после API роутов
- SPA fallback: все несуществующие пути → index.html
- API endpoints: `/api/*`
- Health check: `/health`

### Локальный запуск с Docker
```bash
# Сборка образа
docker build -t calendar-booking .

# Запуск контейнера
docker run -p 3001:3001 -e PORT=3001 calendar-booking

# Приложение будет доступно на http://localhost:3001
```