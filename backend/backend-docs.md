# SkillHub Backend — Current Implementation (Updated)

This document describes the current state of the SkillHub backend implementation, based on the source files in this repository. It aligns the documentation with the code and provides focused improvement suggestions and next steps.

## Quick summary

- Backend: Express.js (TypeScript) application running on Railway.
- Database: PostgreSQL (Supabase-hosted) accessed via Prisma ORM (Prisma Client v6).
- Auth: Custom JWT auth (signed with `JWT_SECRET`) and role-based helpers. Users are stored in the `User` table (email + hashed password).
- Frontend: Next.js + Tailwind CSS deployed on Vercel (frontend repo in `/frontend`).
- Seed: `src/seed.ts` creates an admin user, sample regions and a small skills hierarchy.
- Entry point: `src/express.ts` (dev: `ts-node-dev`, build -> `tsc`).

Repository-level scripts (backend/package.json)

- `yarn dev` or `npm run dev` → `ts-node-dev ./src/express.ts` (development server)
- `yarn build` → `tsc` (compile to `dist`)
- `yarn start` → `node ./dist/express.js` (run compiled app)
- `yarn seed` → `ts-node ./src/seed.ts` (seed DB)

## Environment

Important env vars used by the code:

- `DATABASE_URL` (Prisma datasource)
- `DIRECT_URL` (optional Prisma direct URL in schema)
- `JWT_SECRET` (used to sign/verify JWTs)
- Any other Railway/Supabase connection variables for deployment

Ensure these are set in Railway and locally (e.g., `.env`) before running the app.

## Prisma schema (high level)

The Prisma schema (`prisma/schema.prisma`) defines the primary models used across the API. Important models and notable fields:

- `User` — id (uuid), email (unique), password (hashed), name, headline, bio, regionId, role (enum: USER, INSTRUCTOR, ADMIN), relations: `skills`, `testAttempts`, `bookmarks`, `recommendations`.
- `Skill` — hierarchical skill model with `parentId`, `slug`, `name`, `children`, and relations to `Course`, `Test`, `UserSkill`.
- `UserSkill` — junction table storing `proficiency` (enum), `targetLevel`, `progress` (0–100), `lastPracticed`.
- `Course` — title, provider, `source` (enum: INTERNAL, YOUTUBE, UDEMY, OTHER), `externalId`, `difficulty`, `isPaid`, `priceCents`, relation to `CourseTag` & `CourseSkill`.
- `CourseSkill` — links course to skill with `relevance` (0–100).
- `Tag` / `CourseTag` — course tagging system.
- `Test`, `TestQuestion`, `TestChoice`, `TestAttempt` — testing engine; `TestAttempt.answers` stored as `Json`.
- `Bookmark` — user bookmarks.
- `Recommendation` — user recommendations with `algorithm` enum and `meta` JSON.
- `Region` and `SkillMarketStat` — region metadata and market statistics.

Enums used: `Role`, `ProficiencyLevel`, `CourseSource`, `CourseDifficulty`, `QuestionType`, `RecommendationAlgorithm`.

## Authentication & Authorization

- The app uses JWTs signed with `JWT_SECRET`.
- Middleware `src/middleware/auth.ts` exposes:
  - `authenticateToken` — verifies Bearer token, checks user exists in database, attaches `req.user = { id, email, role }`.
  - `requireRole(role)` — middleware factory that allows the requested role or `ADMIN`.
  - `requireAdmin` — shorthand for `requireRole('ADMIN')`.

Notes on current behavior:

- Tokens are validated by checking `userId` inside the JWT payload and ensuring the user exists in the DB.
- Passwords are hashed using `bcryptjs` (saltRounds = 12) during registration/seed.
- There is no refresh token flow implemented.

## Routes / API Endpoints (implemented in `src/routes`)

All endpoints are mounted under `/api` in `src/express.ts`. Major route files and what they offer:

- `auth.ts` (/api/auth)

  - `POST /register` — create user (validates email/password complexity), returns JWT
  - `POST /login` — login with email/password, returns JWT
  - `PATCH /change-password` — protected; change password with current password validation
  - Rate-limited using `express-rate-limit` (15 min window)

- `users.ts` (/api/users)

  - `GET /:id` — public basic profile info (public fields + public skills list)
  - `GET /:id/profile` — protected full profile (only own profile or admin)
  - `PATCH /:id` — protected update (name, headline, bio, regionId) (only own or admin)
  - `DELETE /:id` — protected delete (hard delete) (only own or admin)
  - `GET /:id/stats` — protected stats (skills, tests, bookmarks, recommendations) (only own or admin)
  - `GET /` — admin-only list users with pagination/filtering

- `userSkills.ts` (mounted under `/api/users`)

  - `GET /:userId/skills` — list user's skills, optional progress
  - `POST /:userId/skills` — protected add skill to user (only own or admin)
  - `PATCH /:userId/skills/:skillId` — protected update user skill
  - `DELETE /:userId/skills/:skillId` — protected remove user skill
  - `GET /:userId/skills/:skillId/progression` — protected, provides recommended courses/tests for progression

- `skills.ts` (/api/skills)

  - `GET /` — list skills with optional filters (parent, search, include children)
  - `GET /:id` — get skill details; `includeStats=true` returns distribution/top users/recent courses
  - `GET /hierarchy/tree` — returns root skills with nested children
  - `GET /search/advanced` — advanced filtering
  - `POST /` — admin-only create skill
  - `PATCH /:id` — admin-only update skill
  - (additional admin endpoints exist down the file)

- `courses.ts` (/api/courses)

  - `GET /` — list courses with many filters (skill, tag, difficulty, freeOnly, provider, source, language, minRating, maxDuration, search), plus pagination
  - `GET /:id` — get course with tags & skills
  - `POST /` — admin-only create course (supports connectOrCreate for tags and creation of course-skill links)
  - `PATCH /:id` — admin-only update course (resets tags/skills when provided)

- `bookmarks.ts` (mounted under `/api/users`)

  - `GET /:id/bookmarks` — protected, list user's bookmarks (pagination)
  - `POST /:id/bookmarks` — protected, create bookmark for user (own only)
  - `DELETE /:id/bookmarks/:courseId` — protected, remove bookmark

- `tests.ts` (/api/tests)

  - `GET /` — list published tests with filters
  - `GET /:id` — test details with questions & non-sensitive choice info
  - `POST /:id/attempts` — protected, create new attempt (prevents multiple incomplete attempts)
  - `PATCH /attempts/:attemptId` — protected, submit answers and complete attempt (auto-grades multiple-choice)
  - `GET /users/:id/attempts` — protected, list attempts for a user

- `recommendations.ts` (/api/recommendations)

  - `GET /` — list recommendations (protected) with optional algorithm/type filters
  - `POST /generate` — protected; generates recommendations using simple rules-based, content-based, or collaborative-filtering implementations included in the code (creates `Recommendation` records)

- `regions.ts` (/api/regions)
  - `GET /` — list regions (public)
  - `GET /:id` — region details with `skillStats`
  - `GET /:id/competition?skillId=` — public endpoint that returns competition stats for a region and skill
  - `GET /:id/ranking/:userId?skillId=` — protected ranking endpoint (own or admin)
  - Admin endpoints: create/update/delete region

Notes:

- Most write operations are restricted to the resource owner or `ADMIN` (enforced by checks on `req.user`).
- Many endpoints return `include` or `_count` fields to provide related data in a single request.

## Seed script

- `src/seed.ts` creates:
  - An admin user with default credentials (`root@flamchustudios.com` / `verysecurepassword$1`) — please change immediately in production.
  - Sample `Region` rows (North America, Europe, Asia Pacific, Latin America, Africa).
  - Sample skills hierarchy (Programming → JavaScript/TypeScript/React/Node.js, Design → UI/UX/Figma, Data Science → ML/SQL).
- Run with `npx prisma db seed` or `npm run seed`.

## Observations from the code (what is present)

- Full stack implementation for managing users, skills, courses, bookmarks, tests, recommendations, and regions.
- Role-based access control with `ADMIN` checks sprinkled across admin-only endpoints.
- Reasonable validation on inputs in the route handlers.
- Recommendations include a simple rules-based/content-based implementation and a basic collaborative filtering example.
- Tests attempted are stored with `answers` JSON so manual grading is feasible later.

## Potential improvements (prioritized)

1. Secrets & Auth

- Move away from manual JWT claim naming assumptions: ensure the token payload includes `userId` consistently. Consider storing `sub` claim and using standard claims. Add token issuer (`iss`) and audience (`aud`) checks.
- Implement refresh tokens and short-lived access tokens for better security.
- Replace manual JWT signature checks with middleware that also verifies token revocation (e.g., store jti in DB or use Supabase Auth session verification if integrating with Supabase Auth). Estimated effort: 1–2 days.

2. Password & Account Security

- Enforce rate limits strictly on auth endpoints (dev limit is permissive: `max: 5000`). Lower for production (e.g., 5–20 per window depending on needs).
- Add email verification and password reset flows (tokens emailed via an SMTP provider). Estimated effort: 2–4 days.

3. Input Validation & Types

- Replace ad-hoc runtime validation with a schema validator (e.g., `zod` or `joi`) and centralize validation logic in middleware.
- Add TypeScript types for request/response DTOs to reduce runtime errors. Estimated effort: 1–2 days.

4. Error handling & logging

- Centralize error handling with an Express error middleware (map Prisma errors to proper HTTP codes). Right now many handlers use inline try/catch.
- Add structured logging (pino/winston) and send errors to a centralized platform (Sentry) in Production. Estimated effort: 1–2 days.

5. Pagination & Performance

- Add proper limit caps and default maximums to prevent heavy queries (max page size e.g., 100).
- Add DB indexes where missing for common filters (search fields already indexed in Prisma for some columns; review slow queries in production logs).
- Consider full-text search using Postgres GIN indexes (for `courses`, `skills`) for better search performance. Estimated effort: 1–3 days.

6. Data safety and soft deletes

- Use `deletedAt` soft-delete pattern on critical models (User, Course) instead of hard deletes to support recovery and analytics.
- Update admin delete endpoints to soft delete and provide reassign/cleanup flows. Estimated effort: 1–2 days + migration.

7. Tests & CI

- Add unit tests for core business logic (recommendation algorithms), route tests (supertest), and integration tests using a test database (Docker or in-memory Postgres).
- Add GitHub Actions CI: install deps, run `npx prisma generate`, `npm run build`, run tests. Estimated effort: 2–4 days.

8. Recommendation improvements

- Persist feature vectors for content-based recommendations and precompute candidate lists (to avoid repeated heavy queries).
- Add scheduled jobs (cron) to refresh recommendations and market stats asynchronously (use Railway scheduled jobs or a worker container). Estimated effort: 2–5 days.

9. Scalability & infra

- Use connection pooling and ensure Prisma connection limits are tuned for Railway + Supabase.
- Add caching for expensive read endpoints (Redis or in-memory LRU) to reduce DB load for high-read endpoints like `/skills/hierarchy/tree` and `/courses`. Estimated effort: 2–4 days.

10. Developer experience

- Add OpenAPI (Swagger) or Postman collection export for the API.
- Add `backend/README.md` with local dev quickstart and env var examples. Estimated effort: 0.5–1 day.

## Short-term concrete next steps (recommended)

1. Reduce auth rate limit to a production-safe value (e.g., `max: 20` per 15 minutes) and rotate the default seed admin password; delete the printed password from the seed script for production.
2. Add a central error handler and move repeated try/catch logic to smaller controller functions.
3. Add request validation with `zod` for `auth`, `users`, and `courses` endpoints.
4. Add basic integration tests for `auth` and `users` endpoints (registration/login and protected route access).
5. Add a `backend/README.md` with these commands and environment examples.

## Files changed / sources used to produce this doc

- `prisma/schema.prisma`
- `src/express.ts`
- `src/seed.ts`
- `src/middleware/auth.ts`
- `src/routes/*` — all route implementations for auth, users, skills, courses, bookmarks, tests, recommendations, regions, userSkills
- `package.json`, `tsconfig.json`

## Requirement mapping (what's implemented vs. noted gaps)

- User registration/login: DONE (JWTs) — Gap: no refresh tokens, no email verification
- User profile & skills: DONE — Gap: soft-delete missing
- Courses: DONE (internal + external id support) — Gap: external syncing jobs not implemented
- Tests engine: DONE (MCQ auto-grading) — Gap: open questions require manual grading flow
- Recommendations: DONE (rules/content/collab prototypes) — Gap: offline precomputation & scalability
- Regions & competition: DONE — Gap: more robust market data ingestion

## Final notes

The project is functionally complete for an MVP with many high-value features implemented end-to-end. Short-term priorities should be security (auth/token lifecycle), data safety (soft deletes), and testing/CI. After that, focus on performance (indexes, caching) and recommendation scalability.
