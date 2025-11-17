# SkillHub Backend — Supabase Auth Implementation (Updated November 2025)

This document describes the current state of the SkillHub backend implementation with fully integrated Supabase Authentication and opt-in social/gamification features, based on the source files in this repository.

## Quick summary

- Backend: Express.js (TypeScript) application running in Docker on Hetzner Cloud.
- Database: PostgreSQL (Supabase-hosted) accessed via Prisma ORM (Prisma Client v6).
- Cache: Redis (ioredis) for social endpoints and frequently accessed data.
- Auth: **Supabase Auth** with secure session management and role-based access control. Users are linked via `supabaseId`.
- Frontend: Next.js 15 + Tailwind CSS v4 deployed on Vercel (frontend repo in `/frontend`).
- AI Service: Python Flask app for AI-powered recommendations and course generation (in `/ai-service`).
- Seed: `src/seed.ts` creates an admin user in Supabase Auth and links to database profile.
- Entry point: `src/express.ts` (dev: `ts-node-dev`, build -> `tsc`).

Repository-level scripts (backend/package.json)

- `pnpm dev` → `ts-node-dev ./src/express.ts` (development server)
- `pnpm build` → `tsc` (compile to `dist`)
- `pnpm start` → `node ./dist/express.js` (run compiled app)
- `pnpm seed` → `ts-node ./src/seed.ts` (seed DB)

## Environment

Important env vars used by the code:

- `DATABASE_URL` (Prisma datasource)
- `DIRECT_URL` (optional Prisma direct URL in schema)
- `SUPABASE_URL` (Supabase project URL)
- `SUPABASE_ANON_KEY` (Supabase anonymous/public key)
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase service role key for server-side operations)
- `REDIS_URL` (Redis connection string for caching)
- Any other Supabase connection variables for deployment

Ensure these are set locally (`.env`) before running the app.

## Prisma schema (high level)

The Prisma schema (`prisma/schema.prisma`) defines the primary models used across the API. Important models and notable fields:

- `User` — id (uuid), **supabaseId** (unique, links to Supabase Auth), email (optional, unique), name, headline, bio, regionId, role (enum: USER, INSTRUCTOR, ADMIN), **deletedAt** (soft delete timestamp), **socialEnabled** (opt-in flag for gamification), **xp** (experience points), **level** (calculated level), **currentStreak** (learning streak days), **longestStreak**, **lastActivityDate**, relations: `skills`, `testAttempts`, `bookmarks`, `recommendations`, `questCompletions`, `xpTransactions`.
- `Skill` — hierarchical skill model with `parentId`, `slug`, `name`, `children`, and relations to `Course`, `Test`, `UserSkill`.
- `UserSkill` — junction table storing `proficiency` (enum), `targetLevel`, `progress` (0–100), `lastPracticed`.
- `Course` — title, provider, `source` (enum: INTERNAL, YOUTUBE, UDEMY, OTHER), `externalId`, `difficulty`, `isPaid`, `priceCents`, relation to `CourseTag` & `CourseSkill`.
- `CourseSkill` — links course to skill with `relevance` (0–100).
- `Tag` / `CourseTag` — course tagging system.
- `Test`, `TestQuestion`, `TestChoice`, `TestAttempt` — testing engine; `TestAttempt.answers` stored as `Json`.
- `Bookmark` — user bookmarks.
- `Recommendation` — user recommendations with `algorithm` enum and `meta` JSON.
- `Region` and `SkillMarketStat` — region metadata and market statistics.
- `Quest` — daily quests with type, title, description, xpReward, targetCount.
- `QuestCompletion` — tracks user quest progress (questId, userId, progress, completed, completedAt).
- `XPTransaction` — audit log of all XP changes with source (LESSON_COMPLETION, COURSE_COMPLETION, etc.).

Enums used: `Role`, `ProficiencyLevel`, `CourseSource`, `CourseDifficulty`, `QuestionType`, `RecommendationAlgorithm`, `QuestType`, `XPSource`.

## Authentication & Authorization

- The app uses **Supabase Auth** with secure session management.
- Middleware `src/middleware/supabaseAuth.ts` exposes:
  - `authenticateSupabaseToken` — verifies Supabase session token, validates user exists in database, attaches `req.user = { id, email, role, supabaseId }`.
  - `requireRole(role)` — middleware factory that allows the requested role or `ADMIN`.
  - `requireAdmin` — shorthand for `requireRole('ADMIN')`.
  - `createUserProfile` — helper for creating user profiles after Supabase registration.

Notes on current behavior:

- Session tokens are validated through Supabase Auth service.
- Passwords are managed entirely by Supabase (secure hashing, reset flows, etc.).
- Supports refresh token flow out of the box.
- Email verification and password reset are handled by Supabase.
- Multi-factor authentication ready for future implementation.

## API Enhancement & Validation System

The backend now features a comprehensive validation and error handling system implemented with Zod and Express middleware:

### Request Validation

- **Zod Schemas** (`src/schemas/index.ts`): Comprehensive validation schemas covering all API endpoints
  - Request parameters (UUIDs, IDs)
  - Query parameters (pagination, filters, search)
  - Request bodies (user input, forms)
  - Enum validation for database types (Role, ProficiencyLevel, etc.)
- **Validation Middleware** (`src/middleware/validation.ts`):
  - `validate()` - Main validation middleware factory
  - `validateBody()`, `validateQuery()`, `validateParams()` - Convenience functions
  - Automatic type coercion and transformation (strings to numbers, etc.)
  - Detailed field-level error reporting

### Error Handling

- **Centralized Error Handler** (`src/middleware/errorHandler.ts`):

  - Maps Prisma errors to user-friendly HTTP responses
  - Handles validation errors with detailed field information
  - Consistent error response format with timestamps and request context
  - Development vs production error detail levels
  - Proper HTTP status codes for different error types

- **Error Response Format**:

```json
{
	"error": "Validation failed",
	"details": [
		{
			"field": "email",
			"message": "Invalid email format",
			"received": "invalid-email"
		}
	],
	"timestamp": "2025-09-12T11:10:17.380Z",
	"path": "/api/auth/login",
	"method": "POST"
}
```

### Key Features

- ✅ **Type Safety**: Full TypeScript integration with runtime validation
- ✅ **Auto-completion**: IDE support for request/response types
- ✅ **Prisma Error Mapping**: Automatic conversion of database errors to HTTP responses
- ✅ **Field Validation**: Detailed validation with field-specific error messages
- ✅ **Async Error Handling**: `catchAsync` wrapper eliminates try/catch boilerplate
- ✅ **404 Handler**: Catch-all route for undefined endpoints
- ✅ **Rate Limiting**: Maintained existing rate limiting on auth endpoints

### Usage Example

```typescript
// Route with validation
router.post(
	"/login",
	validate(extractSchemas(schemas.login)),
	catchAsync(async (req: Request, res: Response) => {
		// req.body is now typed and validated
		const { email, password } = req.body;
		// ... business logic
	})
);
```

## Routes / API Endpoints (implemented in `src/routes`)

All endpoints are mounted under `/api` in `src/express.ts`. Major route files and what they offer:

- `supabaseAuth.ts` (/api/auth)

  - `POST /register` — create user via Supabase Auth, creates linked database profile
  - `POST /login` — login via Supabase Auth, returns session tokens
  - `POST /refresh` — refresh access tokens using refresh token
  - `POST /logout` — secure logout through Supabase
  - `PATCH /change-password` — protected; change password via Supabase Admin API
  - `GET /me` — get current user profile
  - Rate-limited using `express-rate-limit` (20 requests per 15 min window)

- `users.ts` (/api/users)

  - `GET /:id` — public basic profile info (public fields + public skills list)
  - `GET /:id/profile` — protected full profile (only own profile or admin)
  - `PATCH /:id` — protected update (name, headline, bio, regionId) (only own or admin)
  - `PATCH /:id/social-toggle` — protected toggle social environment (only own or admin)
  - `DELETE /:id` — protected soft delete (sets deletedAt, transforms email) (only own or admin)
  - `GET /:id/stats` — protected stats (skills, tests, bookmarks, recommendations) (only own or admin)
  - `GET /` — admin-only list active users with pagination/filtering (excludes soft-deleted)
  - `GET /deleted/list` — admin-only list soft-deleted users with pagination
  - `PATCH /:id/restore` — admin-only restore soft-deleted user account

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

- `social.ts` (/api/social)
  - `GET /profile` — protected, get user's social profile with XP, level, streak (cached 60s)
  - `GET /quests/daily` — protected, get daily quests with progress (cached 5min)
  - `GET /leaderboard/weekly` — protected, top learners last 7 days (cached 5min)
  - `GET /leaderboard/global` — protected, all-time rankings (cached 30min)
  - `GET /xp/history` — protected, paginated XP transaction log
  - `POST /admin/quests` — admin-only, create new quest
  - `PATCH /admin/quests/:id` — admin-only, update quest
  - `DELETE /admin/quests/:id` — admin-only, delete quest
  - `POST /admin/award-xp` — admin-only, manually award XP to user

Notes:

- Most write operations are restricted to the resource owner or `ADMIN` (enforced by checks on `req.user`).
- Many endpoints return `include` or `_count` fields to provide related data in a single request.
- Social endpoints use Redis caching with tiered TTLs for performance optimization.

## Seed script

- `src/seed.ts` creates:
  - An admin user in Supabase Auth with linked database profile (`admin@skillhub.com` / `AdminPass123!`) — change password after first login.
  - Sample `Region` rows (North America, Europe, Asia Pacific, Latin America, Africa).
  - Sample skills hierarchy (Programming → JavaScript/TypeScript/React/Node.js, Design → UI/UX/Figma, Data Science → ML/SQL).
- Run with `npx prisma db seed` or `yarn seed`.

## Observations from the code (what is present)

- Full stack implementation for managing users, skills, courses, bookmarks, tests, recommendations, and regions.
- Role-based access control with `ADMIN` checks sprinkled across admin-only endpoints.
- Reasonable validation on inputs in the route handlers.
- Recommendations include a simple rules-based/content-based implementation and a basic collaborative filtering example.
- Tests attempted are stored with `answers` JSON so manual grading is feasible later.

## Security Features Implemented ✅

1. **Supabase Authentication Integration**

   - ✅ Secure session management with automatic token refresh
   - ✅ Built-in email verification and password reset flows
   - ✅ Rate limiting on auth endpoints (20 requests per 15 min)
   - ✅ Production-ready password hashing and validation
   - ✅ Multi-factor authentication support (ready for configuration)
   - ✅ OAuth provider integration ready

2. **Enhanced Security Measures**

   - ✅ Service role key isolation for server-side operations
   - ✅ Proper token verification through Supabase Auth service
   - ✅ User profile linking with database integrity
   - ✅ Comprehensive audit logging via Supabase dashboard

3. Input Validation & Types ✅ COMPLETED

- ✅ Implemented comprehensive schema validation with `zod` and centralized validation logic in middleware
- ✅ Added TypeScript types for request/response validation with proper error handling
- ✅ Created reusable validation schemas for all API endpoints with proper type safety

4. Error handling & logging ✅ COMPLETED

- ✅ Implemented centralized error handling with Express error middleware that maps Prisma errors to proper HTTP codes
- ✅ Added structured error responses with consistent format, timestamps, and detailed field validation
- ✅ Replaced inline try/catch with catchAsync wrapper and centralized error processing

5. Pagination & Performance ✅ PARTIALLY COMPLETED

- ✅ Redis caching implemented for social endpoints with tiered TTL strategy
- ✅ Cache keys: SOCIAL_PROFILE (60s), DAILY_QUESTS (5min), WEEKLY_LEADERBOARD (5min), GLOBAL_LEADERBOARD (30min)
- Add proper limit caps and default maximums to prevent heavy queries (max page size e.g., 100).
- Add DB indexes where missing for common filters (search fields already indexed in Prisma for some columns; review slow queries in production logs).
- Consider full-text search using Postgres GIN indexes (for `courses`, `skills`) for better search performance. Estimated effort: 1–3 days.

6. Data safety and soft deletes ✅ COMPLETED

- ✅ Implemented `deletedAt` soft-delete pattern on User model for data retention and audit trails
- ✅ Migration: `20251020090346_add_soft_delete_to_users` adds `deletedAt` field with index
- ✅ Updated `DELETE /api/users/:id` to perform soft delete (sets `deletedAt`, transforms email)
- ✅ Authentication middleware blocks soft-deleted users (returns 403 Forbidden)
- ✅ Added admin endpoints: `GET /api/users/deleted/list` and `PATCH /api/users/:id/restore`
- ✅ User list queries automatically filter out soft-deleted users

7. Tests & CI

- Add unit tests for core business logic (recommendation algorithms), route tests (supertest), and integration tests using a test database (Docker or in-memory Postgres).
- Add GitHub Actions CI: install deps, run `npx prisma generate`, `npm run build`, run tests. Estimated effort: 2–4 days.

8. Recommendation improvements

- Persist feature vectors for content-based recommendations and precompute candidate lists (to avoid repeated heavy queries).
- Add scheduled jobs (cron) to refresh recommendations and market stats asynchronously. Estimated effort: 2–5 days.

9. Scalability & infra ✅ PARTIALLY COMPLETED

- ✅ Redis caching implemented with connection pooling via ioredis
- ✅ Cache invalidation strategies for social features (profile updates, XP awards)
- Use connection pooling and ensure Prisma connection limits are tuned for Docker + Hetzner Cloud + Supabase.
- Expand caching to additional high-read endpoints like `/skills/hierarchy/tree` and `/courses`. Estimated effort: 2–4 days.

10. Developer experience

- Add OpenAPI (Swagger) or Postman collection export for the API.
- Add `backend/README.md` with local dev quickstart and env var examples. Estimated effort: 0.5–1 day.

## Implemented Improvements ✅

1. **API Enhancement** ✅ COMPLETED

   - ✅ Added comprehensive request validation with `zod` for all endpoint input validation
   - ✅ Implemented centralized error handling middleware with proper Prisma error mapping
   - ✅ Created reusable validation middleware factory for params, query, and body validation
   - ✅ Standardized error response format with timestamps, paths, and detailed field validation
   - ✅ Added proper TypeScript types and async error handling with catchAsync wrapper

2. **User Soft Delete** ✅ COMPLETED

   - ✅ Added `deletedAt` field to User model with database index
   - ✅ Implemented soft delete on `DELETE /api/users/:id` (data retention for audit trails)
   - ✅ Email transformation on delete to prevent conflicts (`deleted_{userId}@deleted.local`)
   - ✅ Authentication middleware blocks deleted users (403 Forbidden response)
   - ✅ Admin endpoints to list and restore deleted users
   - ✅ User queries automatically filter out soft-deleted accounts

3. **Code Quality** ✅ COMPLETED

   - ✅ Removed debug console.log statements from production code (kept error logging)
   - ✅ All TODO comments resolved with production-ready implementations

4. **Social/Gamification System** ✅ COMPLETED

   - ✅ Opt-in social environment with `socialEnabled` user flag
   - ✅ XP system with level progression (exponential formula: 100 \* 1.5^(level-1))
   - ✅ Daily quests with automatic progress tracking (7 default quests)
   - ✅ Streak system with bonus XP rewards (50 XP per week)
   - ✅ Weekly and global leaderboards with ranking
   - ✅ Redis caching for all social endpoints (tiered TTL strategy)
   - ✅ XP transaction audit log for accountability
   - ✅ Admin endpoints for quest management and manual XP awards
   - ✅ Full documentation in `social-docs.md`
   - ✅ Social toggle API endpoint in users routes

## Remaining Improvement Opportunities

5. **Performance Optimization**

   - Expand Redis caching to additional high-read endpoints (skills hierarchy, courses list)
   - Implement database query optimization and proper indexing for common filters
   - Add connection pooling tuning for Docker + Hetzner Cloud + Supabase

6. **Testing & CI**
   - Add unit tests for core business logic (social service, recommendation algorithms)
   - Implement route tests using supertest
   - Set up GitHub Actions CI pipeline

## Files changed / sources used to produce this doc

- `prisma/schema.prisma`
- `src/express.ts`
- `src/seed.ts`
- `src/config/redis.ts`
- `src/middleware/supabaseAuth.ts`
- `src/middleware/cache.ts`
- `src/routes/*` — all route implementations for auth, users, skills, courses, bookmarks, tests, recommendations, regions, userSkills, social
- `src/services/socialService.ts` — social/gamification business logic
- `package.json`, `tsconfig.json`

## Requirement mapping (what's implemented vs. noted gaps)

- User registration/login: ✅ DONE (Supabase Auth with refresh tokens)
- User profile & skills: ✅ DONE (including soft-delete)
- Social/Gamification: ✅ DONE (XP, quests, streaks, leaderboards with Redis caching)
- Courses: ✅ DONE (internal + external id support) — Gap: external syncing jobs not implemented
- Tests engine: ✅ DONE (MCQ auto-grading) — Gap: open questions require manual grading flow
- Recommendations: ✅ DONE (rules/content/collab prototypes) — Gap: offline precomputation & scalability
- Regions & competition: ✅ DONE — Gap: more robust market data ingestion

## Final notes

The project is production-ready with comprehensive features including authentication, social/gamification system, and Redis caching. The backend follows best practices with validation, error handling, and soft deletes. Short-term priorities should be expanding caching to additional endpoints, implementing comprehensive testing, and adding CI/CD pipelines. The social system provides a complete opt-in gamification experience with XP, quests, streaks, and leaderboards.
