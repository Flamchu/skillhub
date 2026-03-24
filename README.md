# SkillHub

## Česky

SkillHub je výuková platforma zaměřená na dovednosti, postavená jako pnpm workspace. Kombinuje Next.js frontend, Express + Prisma backend a lokální FastAPI AI službu pro autentizaci, objevování kurzů, testování, doporučování a gamifikovaný progres.

### Služby

- `frontend/`: Next.js App Router aplikace pro autentizaci, dashboard, dovednosti, kurzy a profil.
- `backend/`: Express API s Prisma, integrací Supabase auth, Redis funkcemi a wrapped odpověďmi pro frontend.
- `ai-service/`: Lokální FastAPI služba postavená na `sentence-transformers` pro doporučovací workflow.

### Lokální spuštění přes Docker

```bash
cp .env.example .env
# Upravit a nakonfigurovat .env
docker compose up --build -d
docker compose exec backend pnpm prisma:migrate:deploy
docker compose ps
```

Frontend běží na `http://localhost:3000`, API na `http://localhost:4000/api`, AI služba na `http://localhost:5000` a MinIO konzole na `http://localhost:9001`.

## English

SkillHub is a skill-based learning platform built as a pnpm workspace. It combines a Next.js frontend, an Express + Prisma backend, and a local FastAPI AI service for authentication, course discovery, testing, recommendations, and gamified progression.

### Services

- `frontend/`: Next.js App Router application for auth, dashboard, skills, courses, and profile flows.
- `backend/`: Express API with Prisma, Supabase auth integration, Redis-backed features, and wrapped responses for the frontend.
- `ai-service/`: Local FastAPI service powered by `sentence-transformers` for recommendation workflows.

### Local Docker Setup

```bash
cp .env.example .env
# Edit and configure .env
docker compose up --build -d
docker compose exec backend pnpm prisma:migrate:deploy
docker compose ps
```

Frontend runs on `http://localhost:3000`, the API on `http://localhost:4000/api`, the AI service on `http://localhost:5000`, and the MinIO console on `http://localhost:9001`.
