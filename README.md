# JobAppHelper

An AI-powered job search and application assistant for college students and early-career
candidates targeting **data analytics, data science, machine learning, business intelligence,
software engineering, data engineering, product analytics, and quantitative analyst** roles
(internships and new-grad positions included).

JobAppHelper helps you:

- **Discover** real job listings from multiple sources through a pluggable provider architecture
- **Match & rank** jobs against your profile (skills, target roles, interests, remote preference)
- **Save and compare** opportunities
- **Track applications** through a Wishlist → Applied → OA/Assessment → Interviewing → Offer pipeline
- **Auto-generate tailored cover letters** (AI-powered when configured, with a high-quality
  template fallback when it isn't)
- **Find networking connections** — pre-built LinkedIn search links for alumni, employees, and
  recruiters at target companies, plus a simple CRM to track outreach
- **Upload and parse your resume** (PDF/Word) to auto-extract skills into your profile

This is a full-stack, production-shaped application: real PostgreSQL database, JWT auth,
input validation, structured error handling, loading/empty/error states throughout the UI,
and a job-provider abstraction designed to make adding new sources trivial.

---

## Architecture

```
JobAppHelper/
├── backend/            Express + TypeScript API
│   ├── prisma/          Database schema, migrations, seed script
│   └── src/
│       ├── routes/       Express routers + zod validation schemas
│       ├── controllers/  Thin HTTP handlers
│       ├── services/     Business logic (auth, jobs, resumes, cover letters, networking)
│       │   └── providers/  Job source provider architecture (see below)
│       ├── middleware/   auth, validation, error handling, uploads
│       └── utils/        prisma client, JWT helpers, AppError
└── frontend/            React + TypeScript + Vite + Tailwind SPA
    └── src/
        ├── api/           Typed API client modules (axios)
        ├── components/    Reusable UI (jobs, resume, applications, networking, common)
        ├── context/       Auth context (JWT storage + refresh)
        └── pages/         Route-level pages
```

### Job provider architecture

Every job source implements a single interface:

```ts
interface JobProvider {
  readonly key: JobSourceProvider;
  readonly displayName: string;
  fetchJobs(): Promise<NormalizedJob[]>;
}
```

Three providers ship out of the box (`backend/src/services/providers/`):

- **Remotive** (`remotiveProvider.ts`) — free, unauthenticated API of real remote listings
- **Arbeitnow** (`arbeitnowProvider.ts`) — free, unauthenticated job board API
- **Curated sample listings** (`seedProvider.ts`) — a hand-picked set of realistic postings
  (linking to real company career pages) used to seed the database and guarantee the app has
  useful content even if outbound network access to the live providers is unavailable

All providers normalize into a shared `NormalizedJob` shape and are classified into the app's
fixed set of categories/seniority levels by `services/providers/classify.ts`. Jobs are
deduplicated and upserted by `(sourceProvider, sourceJobId)`.

**Adding a new source** (e.g. Adzuna, a company ATS, GitHub Jobs) means writing one file that
implements `JobProvider` and adding it to the `jobProviders` array in
`services/providers/index.ts` — nothing else in the app needs to change.

Jobs are refreshed on a cron schedule (`JOB_SYNC_CRON`, default hourly) and can be triggered
manually via `POST /api/jobs/sync`.

### Cover letter generation

`services/coverLetterService.ts` uses the Anthropic API (`claude-sonnet-5`) when
`ANTHROPIC_API_KEY` is set. If the key is missing, or the API call fails for any reason, it
falls back to a deterministic template generator that still personalizes the letter using the
user's profile, resume-extracted skills, and the job description — so the feature always works,
with or without an API key.

### Matching

`services/jobService.ts#scoreJobForProfile` computes an explainable 0–100 match score per job
from category alignment, target-role keyword hits, skill/tag overlap, interest keyword hits, and
remote-preference match. Used for job search sorting and dashboard recommendations.

---

## Tech stack

| Layer      | Choice |
|------------|--------|
| Database   | PostgreSQL + Prisma ORM |
| Backend    | Node.js, Express, TypeScript, zod validation, JWT auth (access + refresh, rotation) |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, React Hook Form |
| AI         | Anthropic API (optional; graceful template fallback) |
| Resume parsing | `pdf-parse` + keyword-based skill extraction |
| Uploads    | Multer (disk storage, type/size validated) |

---

## Setup

### Prerequisites

- Node.js 18.18+ (Node 22 recommended)
- PostgreSQL 14+ (a `docker-compose.yml` is provided if you'd rather not install it locally)

### 1. Start PostgreSQL

Using Docker:

```bash
docker compose up -d
```

Or point `DATABASE_URL` at any existing PostgreSQL instance — see `backend/.env.example`.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set strong values for JWT_ACCESS_SECRET / JWT_REFRESH_SECRET,
# and DATABASE_URL if not using the default docker-compose credentials.

npm install
npx prisma migrate dev --name init   # creates tables
npm run seed                          # loads sample jobs + a demo user + sample applications
npm run dev                           # starts the API on http://localhost:4000
```

Demo login after seeding: **demo@jobapphelper.dev** / **Password123!**

To enable AI-generated cover letters, set `ANTHROPIC_API_KEY` in `backend/.env`. Without it,
the app automatically uses the template-based generator — no functionality is lost, letters are
just less personalized to free-form job description nuance.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev    # starts the SPA on http://localhost:5173 (proxies /api to :4000)
```

Open http://localhost:5173 and log in with the demo account, or register a new one.

### 4. Keeping job listings fresh

The API syncs all providers on boot (`JOB_SYNC_ON_BOOT=true`) and on a cron schedule
(`JOB_SYNC_CRON`, default hourly). You can also trigger a sync manually while logged in:

```bash
curl -X POST http://localhost:4000/api/jobs/sync -H "Authorization: Bearer <accessToken>"
```

> Note: the Remotive/Arbeitnow providers require outbound internet access from the machine
> running the API. If that network is unavailable (e.g. a locked-down sandbox), the curated
> sample provider still guarantees a working set of realistic listings across every target
> category, and the app degrades gracefully — sync failures for individual providers are
> reported per-provider rather than failing the whole sync.

---

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list. Key ones:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Must be set to strong random values in any real deployment |
| `ANTHROPIC_API_KEY` | Optional — enables AI-generated cover letters |
| `CLIENT_ORIGIN` | Allowed CORS origin for the frontend |
| `JOB_SYNC_CRON` | Cron expression for automatic job refresh |
| `MAX_UPLOAD_MB` | Resume upload size limit |

---

## Security & validation notes

- Passwords hashed with bcrypt (12 rounds); JWT access tokens are short-lived, refresh tokens
  are rotated and stored server-side so they can be revoked on logout
- All request bodies/query/params are validated with zod schemas before hitting controllers
- `helmet`, CORS allow-listing, and per-route rate limiting (stricter on auth endpoints) are
  applied at the Express app level
- Resume uploads are restricted by MIME type and size; files are stored outside of any
  publicly-served directory and only ever returned via an authenticated, ownership-checked
  download endpoint
- Ownership checks guard every resource lookup (resumes, applications, cover letters,
  networking leads) so users can only read/modify their own data

---

## Sample / seed data

`backend/prisma/seed.ts`:

- Loads ~16 curated sample job postings spanning every target category and seniority level
  (internship through new-grad)
- Creates a demo user with a fully filled-out profile (target roles, skills, interests)
- Seeds saved jobs and applications across every pipeline stage (Wishlist, Applied,
  OA/Assessment, Interviewing, Offer)
- Seeds a couple of sample networking leads

Re-run any time with `npm run seed` (from `backend/`) — it's idempotent (upserts by unique keys).

---

## Extending the app

- **New job source**: implement `JobProvider` in `backend/src/services/providers/`, register it
  in `providers/index.ts`.
- **New job category / seniority rule**: update `classify.ts`'s keyword rules and the shared
  `JobCategory`/`SeniorityLevel` enums in `prisma/schema.prisma` (+ migration) and
  `frontend/src/types/index.ts`.
- **New AI feature**: `coverLetterService.ts` shows the pattern (Anthropic client + graceful
  fallback) to follow for any additional AI-assisted feature.
