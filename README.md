# BookMyEvent

MERN event booking app with JWT authentication.

- **Frontend:** React 19 + Vite + Tailwind CSS v4 + shadcn/ui
- **Backend:** Node.js + Express 5 + TypeScript + MongoDB (Mongoose) + tsyringe

## Project structure

```
backend/
  src/
    domain/          # Entities + domain errors (no framework imports)
    application/     # Use cases, DTOs, mappers, outbound ports (interfaces)
    infrastructure/  # Mongoose models/repositories, JWT, bcrypt, DI container, env
    presentation/    # Express controllers, routes, middleware
    shared/          # Cross-cutting constants
    app.ts           # Express app factory
    server.ts        # Composition entry point (DB + HTTP server)

frontend/
  src/
    app/             # Router, providers, route guards
    components/ui/   # shadcn/ui primitives
    features/
      auth/          # Auth API, schemas, context, forms, pages
      account/       # Protected account page
      home/          # Landing page
    shared/          # API client, token storage, shared components
```

The backend follows the dependency rule: `presentation → application → domain`.
Infrastructure implements the ports declared by the application layer, and the
DI container in `infrastructure/di/container.ts` is the only place that wires
concrete implementations.

## Prerequisites

- Node.js 20+
- MongoDB running locally (or a connection string)

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # adjust values if needed
npm run dev            # http://localhost:5001
```

> Port `5001` is used because macOS AirPlay Receiver occupies port `5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

The frontend reads `VITE_API_URL` from `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

## API

| Method | Endpoint             | Auth   | Description                    |
| ------ | -------------------- | ------ | ------------------------------ |
| GET    | `/api/health`        | No     | Health check                   |
| POST   | `/api/auth/register` | No     | Create account, returns token  |
| POST   | `/api/auth/login`    | No     | Sign in, returns token         |
| GET    | `/api/auth/me`       | Bearer | Current user profile           |

Auth responses have the shape:

```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "user", "createdAt": "..." },
  "accessToken": "..."
}
```

Errors use `{ "message": "...", "errors": [{ "field": "...", "message": "..." }] }`.

## Scripts

Backend: `npm run dev`, `npm run build`, `npm start`, `npm run typecheck`.

Frontend: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.

## Auth flow

1. Register/login returns an access token and user.
2. The token is stored in `localStorage` by the frontend token adapter.
3. `AuthProvider` rehydrates the session on refresh via `GET /api/auth/me`.
4. `ProtectedRoute` guards private pages; `GuestRoute` keeps signed-in users out
   of login/register.
