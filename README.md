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
    infrastructure/  # Mongoose models/repositories, JWT, bcrypt, OTP, email, DI, env
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

| Method | Endpoint                  | Auth   | Description                              |
| ------ | ------------------------- | ------ | ---------------------------------------- |
| GET    | `/api/health`             | No     | Health check                             |
| POST   | `/api/auth/register`      | No     | Start registration, emails a 6-digit OTP |
| POST   | `/api/auth/verify-otp`    | No     | Verify OTP, create account, return token |
| POST   | `/api/auth/resend-otp`    | No     | Resend the OTP (60s cooldown)            |
| POST   | `/api/auth/login`         | No     | Sign in, returns token                   |
| GET    | `/api/auth/me`            | Bearer | Current user profile                     |

`POST /api/auth/register` returns a pending-registration payload instead of a
token. The account is only created by `POST /api/auth/verify-otp`:

```json
{
  "email": "you@example.com",
  "message": "Verification code sent. Check your email to continue.",
  "expiresAt": "2026-01-01T00:10:00.000Z",
  "resendAvailableAt": "2026-01-01T00:01:00.000Z",
  "devOtp": "123456"
}
```

`devOtp` is only returned when `NODE_ENV !== production` so the flow is testable
without email infrastructure. In development the OTP is also printed to the API
console. Configure `SMTP_*` in `backend/.env` to send real emails.

Verified auth responses have the shape:

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

1. `POST /api/auth/register` validates the details, hashes the password and
   stores a `PendingRegistration` document (never the raw OTP) with a TTL.
   No user is created yet.
2. A cryptographically secure 6-digit OTP is sent by email (SMTP adapter, or
   the console adapter when SMTP is not configured).
3. `POST /api/auth/verify-otp` checks the code (hashed with bcrypt, max 5
   attempts, 10 min TTL), creates the user, deletes the pending record, and
   returns the access token.
4. The frontend stores the token, and `AuthProvider` rehydrates the session on
   refresh via `GET /api/auth/me`.
5. `ProtectedRoute` guards private pages; `GuestRoute` keeps signed-in users out
   of login/register.

