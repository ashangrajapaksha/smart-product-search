# nx-react-nestjs-ts-boilerplate

A full-stack monorepo boilerplate using Nx, React, Express, TypeScript, and MongoDB.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Nx 22 |
| Frontend | React 19, Vite, React Router v7, Tailwind CSS |
| Backend | Express 5, TypeScript |
| Database | MongoDB via Mongoose |
| Package Manager | pnpm |

## Project Structure

```
apps/
├── web/          # React + Vite frontend (port 3000)
└── api/          # Express TS backend (port 8000)
libs/
└── shared/       # Shared code between web and api
```

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm
- Docker (for MongoDB)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Start MongoDB
```bash
pnpm db:up
```

### 3. Run apps
```bash
# Frontend
pnpm dev:web

# Backend
pnpm dev:api
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev:web` | Start frontend dev server (port 3000) |
| `pnpm dev:api` | Start backend dev server (port 8000) |
| `pnpm build:web` | Build frontend |
| `pnpm build:api` | Build backend |
| `pnpm build:all` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm lint:fix` | Lint and auto-fix |
| `pnpm db:up` | Start MongoDB container |
| `pnpm db:down` | Stop MongoDB container |
| `pnpm docker:up` | Start all services via Docker Compose |
| `pnpm docker:down` | Stop all services |

## Environment Variables

### API (`apps/api/.env.development`)
```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/app_dev
COOKIE_SECRET=dev-cookie-secret
FRONTEND_URL=http://localhost:3000
```

### Web (`apps/web/.env.development`)
```
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_ROOT_DOMAIN=localhost
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check (DB status, uptime) |

## Shared Library

Import shared code in both apps using:
```ts
import { ... } from '@nx-react-nestjs-ts-boilerplate/shared';
```
