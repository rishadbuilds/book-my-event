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

## Frontend

The React app is built with React 19, React Router, Tailwind CSS v4 and a small
typed `apiClient` fetch wrapper. It follows the same `{ data, meta }` envelope
as the API.

| Route              | Access         | Purpose                                       |
| ------------------ | -------------- | --------------------------------------------- |
| `/`                | Public         | Landing page with categories and newest items |
| `/services`        | Public         | Search, filter, sort and page services        |
| `/services/:slug`  | Public         | Service detail, provider info and booking form|
| `/login`           | Guests         | Sign in                                       |
| `/register`        | Guests         | OTP-backed registration                       |
| `/account`         | Signed in      | Profile summary and shortcuts                 |
| `/bookings`        | Signed in      | Customer booking history and cancellation     |
| `/dashboard`       | Provider/Admin | Service management and booking requests       |

Discovery supports text search, category, location, price range, event date and
sorting. Date-filtered listings hide exclusive services that are already booked.
The detail page shows images, provider details, blocked dates and a booking form
with a live price estimate. Providers and admins manage services (including
image uploads, publish/hide and blocked dates) and apply booking status
transitions from the dashboard.

The navbar includes a light/dark theme toggle. The choice is saved in
`localStorage` and applied before React mounts to avoid a flash; on a first
visit the app follows the operating system preference.

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
| GET    | `/api/services`           | No             | Search, filter, sort and page services   |
| GET    | `/api/services/meta`      | No             | Categories, locations and price range    |
| GET    | `/api/services/:slug`     | No             | Public service detail                    |
| POST   | `/api/services`           | Provider/Admin | Create a service                         |
| PATCH  | `/api/services/:id`       | Provider/Admin | Update a service (owner or admin)        |
| DELETE | `/api/services/:id`       | Provider/Admin | Soft-delete a service (owner or admin)   |
| GET    | `/api/provider/services`  | Provider/Admin | Provider's services; admin sees all     |
| GET    | `/api/provider/services/:id` | Provider/Admin | Service detail for management         |
| POST   | `/api/bookings`           | Bearer         | Create a booking for a service           |
| GET    | `/api/bookings`           | Bearer         | Current customer's bookings              |
| GET    | `/api/bookings/:id`       | Bearer         | Booking detail (customer/provider/admin) |
| PATCH  | `/api/bookings/:id/status` | Bearer        | Apply a booking status transition        |
| GET    | `/api/provider/bookings`  | Provider/Admin | Provider's bookings; admin sees all      |

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

## Service discovery

`GET /api/services` supports the following query parameters:

| Parameter  | Values                                                       | Default  |
| ---------- | ------------------------------------------------------------ | -------- |
| `q`        | Free-text search across name, description and location       | –        |
| `category` | `venue`, `hotel`, `catering`, `photography`, `dj`, `decoration`, `event-planner` | – |
| `location` | Exact, case-insensitive location                             | –        |
| `minPrice` | Minimum price                                                | –        |
| `maxPrice` | Maximum price                                                | –        |
| `date`     | ISO date; excludes services blocking that day                | –        |
| `sort`     | `newest`, `price-asc`, `price-desc`                          | `newest` |
| `page`     | Page number (1-based)                                        | `1`      |
| `limit`    | Page size (max 48)                                           | `12`     |

Public listings and detail pages only return active services. Provider listings
include inactive services so owners can reactivate them. `DELETE` is a soft
delete (`isActive: false`) so booking history and shared links stay valid.

Providers can only create, update, and delete their own services; admins can
manage every service. Admin-created services must include a `providerId`.
Service slugs are generated from the name and made unique with a numeric suffix.

## Bookings

A booking stores a snapshot of the service name, location, image, unit price,
and the customer's contact details, so history stays readable if a service is
edited later. The server calculates `totalPrice`: per-person services multiply
the unit price by `guestCount`; all other price units use the service price.

```json
{
  "serviceId": "…",
  "eventDate": "2027-03-15",
  "guestCount": 120,
  "notes": "Window seats for grandparents",
  "phone": "+91 99887 70000"
}
```

`phone` is optional when the customer's profile already has one. Bookings cannot
be created for inactive services, dates blocked by the provider, past dates, or
your own service.

### Status lifecycle

| From        | Allowed next states                   |
| ----------- | ------------------------------------- |
| `pending`   | `confirmed`, `rejected`, `cancelled`  |
| `confirmed` | `completed`, `cancelled`              |
| `rejected`  | –                                     |
| `cancelled` | –                                     |
| `completed` | –                                     |

Customers may cancel their own pending or confirmed bookings. Providers may
confirm, reject, complete, or cancel bookings for their services. Admins may
apply any valid transition. Terminal states cannot be reopened.

### Double-booking protection

Exclusive services (`allowsMultipleBookings: false`) can only have one active
booking per calendar day. A partial unique index on
`{ serviceId, eventDate, isActive }` where `isActive: true` enforces this in
MongoDB, including when two requests race. Terminal statuses release the slot.

Services with `allowsMultipleBookings: true` create bookings with
`isActive: false`, bypassing the partial index. `GET /api/services?date=...`
excludes exclusive services that already hold a booking on that day.

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
`npm test`, `npm run test:watch`, `npm run seed`.

Frontend: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.

## Testing

The backend has an automated integration suite built with Vitest, Supertest and
`mongodb-memory-server`. It starts a disposable MongoDB instance, exercises the
real Express app and cleans the database between tests.

```bash
cd backend
npm test            # run once
npm run test:watch  # watch mode
```

The suite covers auth/OTP, profile and password changes, service discovery,
provider/admin permissions, booking creation and pricing, availability,
double-booking protection (including the concurrent race), listing scopes and
the full booking status lifecycle.

`mongodb-memory-server` reuses a locally installed `mongod` binary when one is
found at `/opt/homebrew/bin/mongod`, `/usr/local/bin/mongod` or
`/usr/bin/mongod`. Otherwise it downloads a compatible binary on first run. No
external database or running server is required.

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

