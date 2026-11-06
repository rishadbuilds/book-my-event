# BookMyEvent

MERN event service booking platform with JWT authentication, role-based access,
service listings, and local image uploads.

- **Frontend:** React 19 + Vite + Tailwind CSS v4 + shadcn/ui
- **Backend:** Node.js + Express 5 + TypeScript + MongoDB (Mongoose) + tsyringe
- **Roles:** `user`, `provider`, `admin`

## Project structure

```
backend/
  src/
    domain/          # Entities + domain errors (no framework imports)
    application/     # Use cases, DTOs, mappers, outbound ports (interfaces)
    infrastructure/  # Mongoose models/repositories, JWT, bcrypt, OTP, email, storage, DI, env
    presentation/    # Express controllers, routes, middleware
    scripts/         # Idempotent seed script
    shared/          # Cross-cutting constants and utilities
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

| Method | Endpoint                  | Auth           | Description                              |
| ------ | ------------------------- | -------------- | ---------------------------------------- |
| GET    | `/api/health`             | No             | Health check                             |
| POST   | `/api/auth/register`      | No             | Start registration, emails a 6-digit OTP |
| POST   | `/api/auth/verify-otp`    | No             | Verify OTP, create account, return token |
| POST   | `/api/auth/resend-otp`    | No             | Resend the OTP (60s cooldown)            |
| POST   | `/api/auth/login`         | No             | Sign in, returns token                   |
| GET    | `/api/auth/me`            | Bearer         | Current user profile                     |
| PATCH  | `/api/auth/profile`       | Bearer         | Update name, phone, avatar, bio, business |
| PATCH  | `/api/auth/password`      | Bearer         | Change the current password              |
| POST   | `/api/uploads/images`     | Provider/Admin | Upload 1–6 service images                |
| GET    | `/uploads/*`              | No             | Serve uploaded images                    |

Successful responses use a single envelope:

```json
{ "data": { "...": "..." } }
```

List endpoints add pagination metadata:

```json
{ "data": [], "meta": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 } }
```

`POST /api/auth/register` returns a pending-registration payload instead of a
token. The account is only created by `POST /api/auth/verify-otp`:

```json
{
  "data": {
    "email": "you@example.com",
    "message": "Verification code sent. Check your email to continue.",
    "expiresAt": "2026-01-01T00:10:00.000Z",
    "resendAvailableAt": "2026-01-01T00:01:00.000Z",
    "devOtp": "123456"
  }
}
```

`devOtp` is only returned when `NODE_ENV !== production` so the flow is testable
without email infrastructure. In development the OTP is also printed to the API
console. Configure `SMTP_*` in `backend/.env` to send real emails.

Verified auth responses have the shape:

```json
{
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "user",
      "phone": "+91 90000 00000",
      "businessName": "...",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "..."
  }
}
```

Errors use `{ "message": "...", "errors": [{ "field": "...", "message": "..." }] }`.

## Seed data

```bash
cd backend
SEED_PASSWORD=ChangeMe123 npm run seed
```

The seed is idempotent and creates 1 admin, 2 providers, 1 demo user, and 15
services with local placeholder images. Re-running it updates the seeded
records instead of duplicating them.

| Account  | Email                        |
| -------- | ---------------------------- |
| Admin    | `admin@bookmyevent.local`    |
| Provider | `provider@bookmyevent.local` |
| Provider | `studio@bookmyevent.local`   |
| User     | `user@bookmyevent.local`     |

When `SEED_PASSWORD` is omitted, a random password is generated and printed
once by the seed script. Passwords are only set when an account is first
created.

## Environment variables

| Variable                    | Required | Default                 | Purpose                              |
| --------------------------- | -------- | ----------------------- | ------------------------------------ |
| `MONGODB_URI`               | Yes      | –                       | MongoDB connection string            |
| `JWT_SECRET`                | Yes      | –                       | JWT signing secret (min 16 chars)    |
| `PORT`                      | No       | `5001`                  | API port                             |
| `FRONTEND_URL`              | No       | `http://localhost:5173` | CORS origin                          |
| `JWT_EXPIRES_IN`            | No       | `1d`                    | Access-token lifetime                |
| `OTP_TTL_MINUTES`           | No       | `10`                    | OTP validity                         |
| `OTP_MAX_ATTEMPTS`          | No       | `5`                     | Failed OTP attempts allowed          |
| `OTP_RESEND_COOLDOWN_SECONDS` | No     | `60`                    | Resend cooldown                      |
| `UPLOAD_DIR`                | No       | `uploads`               | Local upload directory               |
| `UPLOAD_MAX_FILE_SIZE_MB`   | No       | `5`                     | Maximum size per image               |
| `UPLOAD_MAX_FILES`          | No       | `6`                     | Maximum images per upload request    |
| `SMTP_*` / `EMAIL_FROM`     | Prod     | console adapter         | Real email delivery                  |
| `SEED_PASSWORD`             | No       | generated               | Password for newly seeded accounts   |

## Scripts

Backend: `npm run dev`, `npm run build`, `npm start`, `npm run typecheck`,
`npm run seed`.

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

## Roles and authorization

- **User** — browses services, creates bookings, manages their own bookings.
- **Provider** — manages their own services and the bookings for those services.
- **Admin** — platform-wide access to services, bookings, and statistics.

Self-registration always creates a `user`. Providers are created by an admin or
by the seed script. Routes use `authorize(...roles)` after `authenticate`;
ownership checks live in the use cases rather than the controllers.

## Image uploads

Images are accepted as multipart `images` fields (up to `UPLOAD_MAX_FILES`) and
stored on local disk by `LocalFileStorage`, which implements the
`IFileStorage` port. Public URLs are returned as `/uploads/...`. Replacing the
adapter with S3 or Cloudinary later does not require changes to controllers or
use cases.

