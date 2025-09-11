it. You want a **properly formatted `documentation.md`** with fenced code blocks, clear sections, and markdown best practices. I’ll rewrite the file so it renders cleanly in any Markdown viewer.

Here’s the corrected version:

# SkillHub Backend Documentation

## Overview

The SkillHub backend provides a RESTful API for managing user profiles, skills, courses, tests, recommendations, and competition statistics. It is built with **Express (TypeScript)**, **Prisma ORM**, and **PostgreSQL (Supabase on Railway)**.

This document covers:

- Project requirements and objectives (from the original assignment)
- Database schema (Prisma models)
- API design (endpoints, request/response formats)
- Authentication and security
- Data seeding and integrations
- Development workflow
- Testing and monitoring

---

## Project Requirements Recap

- Web application for planning and developing professional skills.
- Users can:
  - Create and manage a personal skill profile.
  - Select target areas of development.
  - Receive course recommendations.
  - Take tests to validate knowledge.
  - Compare progress with other users in their region.
- Course sources:
  - Internal curated database (30–50 entries).
  - External APIs (YouTube, Udemy) optional.

---

## Technology Stack

- **Backend:** Express.js (TypeScript)
- **Database:** PostgreSQL (Supabase, hosted on Railway)
- **ORM:** Prisma
- **Auth:** Supabase Auth (JWT tokens, OAuth providers optional)
- **Testing:** Postman collections + Jest (optional)
- **Deployment:** Railway

---

## Database Schema (Prisma)

The backend schema is defined in `prisma/schema.prisma`.

### Core Models

- **User**: Represents an individual user. Links to skills, tests, bookmarks, recommendations, and region.
- **Skill**: Hierarchical model of professional skills (supports parent-child relations).
- **UserSkill**: Junction storing proficiency levels and progress per user.
- **Course**: Educational material entry (internal or external).
- **CourseSkill**: Links courses to skills with relevance.
- **Tag** / **CourseTag**: Tagging system for courses.
- **Test**, **TestQuestion**, **TestChoice**, **TestAttempt**: Testing engine.
- **Bookmark**: Saved courses by users.
- **Recommendation**: Generated suggestions with metadata.
- **Region** / **SkillMarketStat**: Regional statistics for competition analysis.

Example snippet:

```prisma
model User {
  id             String   @id @default(uuid())
  supabaseId     String?  @unique
  email          String?  @unique
  name           String?
  regionId       String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## API Design

**Base URL:**

```
https://<your-domain>/api
```

### Authentication

- All endpoints require authentication unless specified.
- Supabase JWT tokens are validated in middleware.
- `req.user` is populated with the decoded user payload.

### Endpoints

#### Users

```http
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

#### Skills

```http
GET    /skills
GET    /skills/:id
POST   /skills       (admin)
PATCH  /skills/:id   (admin)
DELETE /skills/:id   (admin)
```

#### User Skills

```http
GET    /users/:id/skills
POST   /users/:id/skills
PATCH  /users/:id/skills/:skillId
DELETE /users/:id/skills/:skillId
```

#### Courses

```http
GET    /courses?skillId=&tag=&difficulty=&freeOnly=
GET    /courses/:id
POST   /courses       (admin)
PATCH  /courses/:id   (admin)
DELETE /courses/:id   (admin)
```

#### Bookmarks

```http
GET    /users/:id/bookmarks
POST   /users/:id/bookmarks
DELETE /users/:id/bookmarks/:courseId
```

#### Tests

```http
GET    /tests
GET    /tests/:id
POST   /tests              (admin)
POST   /tests/:id/attempts
PATCH  /tests/attempts/:attemptId
GET    /users/:id/attempts
```

#### Recommendations

```http
GET    /recommendations?userId=
POST   /recommendations/generate
```

#### Regions and Competition

```http
GET /regions
GET /regions/:id/competition?skillId=
```

---

## Authentication & Security

- **Supabase Auth** handles registration, login, and token issuance.
- Each API request must include:

  ```
  Authorization: Bearer <JWT>
  ```

- Middleware verifies the token and ensures valid `supabaseId` exists in the User table.

---

## Data Seeding

- `prisma/seed.ts` populates:

  - \~50 curated courses (with source, tags, difficulty).
  - Skills hierarchy (e.g., HTML → CSS → JavaScript → React).
  - Example users with `UserSkill` relations.
  - Test sets with questions.

Run seeding:

```bash
npx prisma db seed
```

---

## Integrations

- **Internal mode (default):** Uses only seeded course database.
- **External mode:** Optionally fetches courses via YouTube API / Udemy API.

  - Store external references in `Course.externalId` and `Course.source`.
  - Sync jobs can be scheduled (e.g., daily) to update courses.

---

## Development Workflow

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start dev server
npm run dev
```

---

## Testing

- API testing via **Postman collection** (`/docs/postman_collection.json`).
- Suggested flow:

  1. Register/login user.
  2. Add skills.
  3. Fetch courses and bookmark one.
  4. Generate recommendations.
  5. Take a test and submit answers.
  6. Check competition stats.

Optional: Jest unit tests for service logic.

---

## Monitoring & Logging

- Use **Railway logs** for live request/error tracking.
- Integrate **Prometheus + Grafana** (optional).
- Prisma query logging enabled in development.

---

## Roadmap for Extension

- Add collaborative filtering recommendations.
- Enable full-text search with PostgreSQL GIN indexes.
- Implement soft-deletes (`deletedAt` field) for Users and Courses.
- Introduce GraphQL API gateway in addition to REST.

---

## Conclusion

This backend provides all functionality required for SkillHub: user profiles, skill tracking, curated/external courses, testing, recommendations, and competition analysis. It is modular, extensible, and ready for integration with the Next.js frontend.

```

```
