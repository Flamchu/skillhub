# SkillHub Project Summary

## 1. Repository layout and responsibilities

SkillHub is a pnpm workspace that groups three services plus shared tooling:

- `frontend/`: Next.js App Router client (standalone, no Next API routes)
- `backend/`: Express + Prisma API with Supabase Auth integration
- `ai-service/`: Python Flask helper for AI-driven recommendations/course generation
- Root config: `pnpm-workspace.yaml`, `docker-compose*.yml`, shared scripts in `package.json`

The intent is a clean separation of concerns: the frontend is a pure client, the backend is the sole
API surface for auth/data, and the AI service is an internal helper invoked by the backend.

## 2. Frontend architecture (Next.js App Router)

Core traits from `frontend/frontend-docs.md`:

- Framework: Next.js App Router (React 19 per docs), Turbopack dev/build
- Rendering strategy: Server Components for public/SEO surfaces; Client Components for auth and
  interactive flows
- Data layer: centralized HTTP client in `frontend/src/lib/http.ts` with auth token injection,
  normalized errors, retry/backoff for idempotent GETs
- State: TanStack Query + React Context for auth, React Hook Form + Zod for forms/validation
- Auth model: frontend never calls Supabase directly; it talks only to backend `/api/*` endpoints
- i18n: locale-based routing under `src/app/[locale]/`

Implemented pages live under `frontend/src/app/[locale]/` with initial routes for auth,
register, dashboard, skills, courses, and profile. UI primitives and feature components are
organized under `frontend/src/components/` with shared libraries under `frontend/src/lib/`.

## 3. Backend architecture (Express + Prisma + Supabase)

Backend implementation highlights from `backend/backend-docs.md`:

- Express.js (TypeScript) service, entry at `backend/src/express.ts`
- Prisma ORM (Client v6) backed by Supabase Postgres
- Supabase Auth used for session management and user identity; `supabaseId` is the linkage
- Redis used for caching and social/gamification endpoints
- Validation pipeline with Zod schemas, request validators, and centralized error handling

Routes live under `backend/src/routes` and are mounted under `/api`. Auth endpoints include
`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, and `/auth/me`. User/profile
routes support social opt-in, soft deletes, and admin-only recovery flows. All responses are
expected to be wrapped in predictable envelopes (e.g., `{ user: ... }` or `{ error: ... }`)
to match the frontend HTTP client contract.

## 4. Data model and domain focus

The Prisma schema centers on the learning platform domain:

- Identity: `User` linked to Supabase via `supabaseId`, with role-based access control
- Skills: hierarchical `Skill` tree, `UserSkill` progress and proficiency tracking
- Courses: `Course`, `Tag`, and linking tables for skills/tags with relevance scores
- Testing: `Test`, `TestQuestion`, `TestChoice`, `TestAttempt` with JSON answers
- Social/gamification: `Quest`, `QuestCompletion`, `XPTransaction`, streak tracking on `User`
- Analytics/metadata: `Region`, `SkillMarketStat`, recommendations with algorithm metadata

This model supports a progression loop: learn skills, take tests, earn XP/streaks, and see
recommendations influenced by profile, region, and activity.

## 5. Auth and session flow (client + server)

The auth loop is intentionally backend-centric:

1. Client submits credentials to `/api/auth/login`.
2. Backend authenticates against Supabase Auth and returns access + refresh tokens plus profile.
3. Client stores tokens (localStorage) and injects the access token on API requests.
4. On 401s, the client attempts `/api/auth/refresh` and retries once.
5. `/api/auth/me` refreshes profile state without direct Supabase calls.

Role-gated access is enforced on the backend (middleware) and planned in the frontend via
role guard hooks/layouts.

## 6. AI service role

`ai-service/` is a small Flask app (see `ai-service/app.py`) running via `start.sh`, typically
exposed only to the backend. It provides AI-powered recommendations and course generation
capabilities while keeping the main API surface consistent.

## 7. Build, dev, and operational commands

Workspace commands (root `package.json`):

- `pnpm dev`: run all services concurrently
- `pnpm frontend:dev`, `pnpm backend:dev`, `pnpm ai:dev`: target each service
- `pnpm frontend:build`, `pnpm backend:build`: production builds
- `pnpm frontend:start`: serve the compiled Next.js frontend
- `pnpm seed`: seed backend data (creates admin user and profile linkage)

Frontend quality gates (per repo guidelines):

- `pnpm --filter frontend lint`
- `pnpm --filter frontend lint:fix`
- `pnpm --filter frontend type-check`
- `pnpm --filter frontend format`

## 8. Environment and infrastructure

Key environment variables:

- Backend: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `REDIS_URL`
- Optional media storage: `S3_*`/`MINIO_*` for profile images and assets
- Frontend: `NEXT_PUBLIC_BACKEND_URL` (plus any public media URLs if configured)

Deployment is Docker-first for the backend (Hetzner Cloud per docs) and Vercel-hosted for the
frontend. `docker-compose.yml` and `docker-compose.prod.yml` align ports and service wiring.

---

If you want, I can add a diagram or a deeper section on API surfaces and planned routes.
