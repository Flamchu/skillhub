# SkillHub

SkillHub is a skill-based learning platform built as a pnpm workspace. It combines a Next.js frontend, an Express + Prisma backend, and a local FastAPI AI service for authentication, course discovery, testing, recommendations, and gamified progression.

## Services

- `frontend/`: Next.js App Router application for auth, dashboard, skills, courses, and profile flows.
- `backend/`: Express API with Prisma, Supabase auth integration, Redis-backed features, and wrapped responses for the frontend.
- `ai-service/`: Local FastAPI service powered by `sentence-transformers` for recommendation workflows.

## Local Docker Setup

```bash
cp .env.example .env
${EDITOR:-nano} .env
docker compose up --build -d
docker compose exec backend pnpm prisma:migrate:deploy
docker compose ps
```

Frontend runs on `http://localhost:3000`, the API on `http://localhost:4000/api`, the AI service on `http://localhost:5000`, and the MinIO console on `http://localhost:9001`.
