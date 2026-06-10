# Invoice Dashboard

A full-stack invoice dashboard to track payments, overdue invoices, and aging buckets.

---

## Features

- View all invoices
- Track **paid / unpaid / overdue**
- Aging buckets (Current, 1–30, 31–60, 61–90, 91+)
- Filter by:
  - status
  - overdue
  - client
  - amount
- Sort by due date or amount
- URL-based filters (shareable links)

---

## Tech Stack

- **Frontend**: React + Vite + TypeScript  
- **Backend**: Node.js + Express + TypeScript  
- **Database**: PostgreSQL (via Prisma)

---

## Structure

```
client/              → React frontend
server/              → Express backend
server/src/data/     → Shared mock demo dataset
```

---

## Choose your setup

| Option | Docker | Database | Seed | Backend | Best for |
|--------|--------|----------|------|---------|----------|
| **A. Full stack (Docker)** | Yes | Postgres via compose | Yes | Yes | Local development |
| **B. Full stack (own Postgres)** | No | Your Postgres instance | Yes | Yes | Existing DB setup |
| **C. Frontend demo** | No | No | No | No | Quick UI demo |
| **D. Backend mock API** | No | No | No | Yes (in-memory) | API demo without DB |

Mock data is **read-only** — filters and sort work, but nothing is persisted.

### Option A — Full stack with Docker

**1. Install dependencies**

```bash
cd server && npm install
cd ../client && npm install
```

**2. Start database** (from repo root)

```bash
docker compose up -d
```

PostgreSQL listens on port **5433** (mapped from the container's 5432) to avoid conflicts with a system PostgreSQL install on 5432.

**3. Configure and run backend**

```bash
cd server
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run seed
npm run dev
```

Backend: http://localhost:3000

**4. Run frontend**

```bash
cd client
npm run dev
```

Frontend: http://localhost:5173

---

### Option B — Full stack with your own Postgres

Same as Option A, but skip Docker. Point `DATABASE_URL` in `server/.env` at your Postgres instance, then run `db:migrate` and `seed` as above.

---

### Option C — Frontend demo (fastest)

No Docker, database, seed, or backend required.

```bash
cd client
npm install
npm run dev:demo
```

Open http://localhost:5173 — filters, sort, KPIs, and chart run entirely in the browser using shared mock data from [`server/src/data/mockInvoices.ts`](server/src/data/mockInvoices.ts).

Alternatively, set in `client/.env`:

```bash
VITE_USE_MOCK_DATA=true
```

---

### Option D — Backend mock API

Demo the real Express API without a database.

**Terminal 1 — backend**

```bash
cd server
npm install
npm run dev:mock
```

**Terminal 2 — frontend**

```bash
cd client
npm install
npm run dev
```

Do **not** set `VITE_USE_MOCK_DATA` — the client talks to the API, which serves in-memory mock data.

---

## Environment Variables

### Backend (server/.env)

```bash
DATABASE_URL="postgresql://invoice:invoice@localhost:5433/invoice_dashboard"
DATABASE_SSL=false
CORS_ORIGIN=http://localhost:5173
# API_KEY=          # optional locally; required in production
# USE_MOCK_DATA=true   # Option D only; DATABASE_URL not required
```

Copy from `server/.env.example` for local development.

### Frontend (client/.env)

```bash
VITE_API_BASE_URL=
# VITE_API_KEY=     # must match server API_KEY when set
# VITE_USE_MOCK_DATA=true   # Option C only
```

Leave `VITE_API_BASE_URL` empty in local dev to use the Vite proxy (`/api` → `localhost:3000`).

## API

```
GET /api/invoices
GET /api/kpis
GET /api/charts/paid-unpaid
```

Example:

```
/api/invoices?overdue=true&status=unpaid
```

## Deployment

- Backend → Render (Web Service)
- Frontend → Render (Static Site)
- Database → Render (PostgreSQL)

### Backend (Render Web Service)

1. Create a **Render PostgreSQL** database and copy its internal connection string.
2. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` — Render PostgreSQL internal URL
   - `DATABASE_SSL=true`
   - `CORS_ORIGIN` — your frontend URL (e.g. `https://your-frontend.onrender.com`)
   - `API_KEY` — generate with `openssl rand -hex 32`
   - `DATABASE_SSL_REJECT_UNAUTHORIZED=false` — only if your Postgres host requires it
3. Build command:

```bash
npm install && npm run db:generate && npm run db:migrate:deploy
```

4. Start command:

```bash
npm start
```

### Frontend (Render Static Site)

Set at build time:

```bash
VITE_API_BASE_URL=https://your-backend-url
VITE_API_KEY=<same value as server API_KEY>
```

### Static site security headers (Render dashboard)

Add response headers for the frontend static site:

- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'; connect-src 'self' https://your-backend-url; script-src 'self'; style-src 'self' 'unsafe-inline'`

## Security

- **API key:** When `API_KEY` is set on the server, all `/api/*` routes require `X-API-Key` or `Authorization: Bearer`. `/health` stays public.
- **SPA limitation:** `VITE_API_KEY` is embedded in the client bundle at build time. It blocks casual scanners but is not a true secret against someone who inspects the JS. Combine with strict `CORS_ORIGIN` and network controls.
- **Docker credentials:** `invoice:invoice` in `docker-compose.yml` is for local dev only. Postgres binds to `127.0.0.1:5433`.
- **Rate limiting:** API routes are limited to 100 requests per 15 minutes per IP.

## Notes

- Overdue = unpaid invoices past due date
- Aging buckets are based on days past due

## License

MIT
