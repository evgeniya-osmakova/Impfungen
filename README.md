# Impfungen Workspace

![Node.js 22](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)
![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

Impfungen is a vaccination tracking workspace with a React frontend and a Fastify + tRPC backend backed by PostgreSQL.

## Product Scope

- Single shared profile (no authentication/authorization).
- Designed for one person managing personal and family vaccination data in one workspace.

## Tech Stack

- `frontend`: React 19, Vite, TypeScript, Zustand, i18next
- `backend`: Fastify 5, tRPC 11, Drizzle ORM, TypeScript
- `postgres`: PostgreSQL 16

## System Overview

```mermaid
flowchart LR
  FE["Frontend (React + Vite)<br/>http://localhost:5173"] -->|"tRPC over HTTP"| BE["Backend (Fastify + tRPC)<br/>http://localhost:3000/trpc"]
  BE -->|"Drizzle + SQL"| DB["PostgreSQL 16<br/>localhost:5432"]
```

## Main Features

- Primary + family account management
- Vaccination records (create, edit, delete)
- Future dose planning (manual dates or repeat interval)
- Upcoming vaccinations view (next 12 months)
- CSV import for completed vaccinations
- CSV and PDF export
- UI localization: English, Russian, German

## Quick Start (Docker Compose)

### Prerequisites

- Docker
- Docker Compose plugin

### Run

```bash
docker compose up --build
```

### Service URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432

### Stop

```bash
docker compose down
```

## Local Development (Without Docker)

### 1. Start PostgreSQL

You can reuse Compose for DB only:

```bash
docker compose up -d postgres
```

### 2. Run backend

```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

### 3. Run frontend

```bash
cd frontend
yarn install
yarn start
```

### 4. Open app

- http://localhost:5173

## Environment Variables

### Backend (`backend`)

- `DATABASE_URL` (default: `postgres://postgres:postgres@localhost:5432/impfungen`)
- `CORS_ORIGIN` (default: `*`)
- `HOST` (default: `0.0.0.0`)
- `PORT` (default: `3000`)

### Frontend (`frontend`)

- `VITE_API_BASE_URL` (default: `http://localhost:3000`)

## Useful Commands

### Backend

```bash
cd backend
npm test
npm run build
npm run check
```

### Frontend

```bash
cd frontend
yarn test
yarn lint
yarn build
yarn check
```

## Pre-commit Formatting

Repository uses a native Git hook in `.githooks/pre-commit` to run Biome formatting only for staged files in `frontend` and `backend`.

Enable it once per machine:

```bash
git config core.hooksPath .githooks
```

## Project Structure

```text
.
├── backend
├── frontend
└── docker-compose.yml
```

## Health Check

- Backend health endpoint: `GET http://localhost:3000/health`
