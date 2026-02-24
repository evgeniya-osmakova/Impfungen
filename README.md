# Impfungen Workspace

## Current product scope (important)

This project currently targets a single user and does not implement authentication or authorization.
The intended usage is one person managing their own vaccination data and the data of family members
inside one shared profile.

Проект разделён на два сервиса:

- `frontend` — React + Vite приложение
- `backend` — Fastify + tRPC + Drizzle API
- `postgres` — хранилище данных профиля и прививок

## Совместный запуск (Docker Compose)

```bash
docker compose up --build
```

Сервисы будут доступны на:

- frontend: http://localhost:5173
- backend: http://localhost:3000
- postgres: localhost:5432

Остановка:

```bash
docker compose down
```

## Локальный запуск без Docker

Frontend:

```bash
cd frontend
yarn install
yarn start
```

Backend:

```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

Для backend можно переопределить переменные:

- `DATABASE_URL` (по умолчанию `postgres://postgres:postgres@localhost:5432/impfungen`)
- `CORS_ORIGIN` (по умолчанию `*`)
- `HOST` (по умолчанию `0.0.0.0`)
- `PORT` (по умолчанию `3000`)
