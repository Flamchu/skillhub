# SkillHub Frontend Documentation (Revised – Standalone Client, Updated: November 2025)

This document defines the architecture, information architecture (IA), component system, data flows, and implementation guidelines for the SkillHub frontend as a **pure standalone client**. It consumes a separately hosted backend (Docker + Hetzner Cloud) + Supabase Auth and does **not** expose its own API routes (no Next.js route handlers). All interactions occur over HTTP to the backend REST API.

> Status: Core auth context, minimal layout, and initial pages (`/auth`, `/register`, `/dashboard`, `/skills`, `/courses`) plus primitive ui components (button, input, card, badge, avatar, theme toggle) are implemented. Social/gamification features partially implemented (XP bar, profile toggle). Remaining sections describe target future build-out.

## 1. High-Level Overview

- **Framework**: Next.js 15 (App Router, React 19, Turbopack dev/build)
- **Styling**: Tailwind CSS 4 + design tokens (extended config) + utility-first composition
- **Auth**: backend-issued access + refresh tokens (backend integrates with supabase internally). frontend never calls supabase directly; it only uses backend routes (`/api/auth/login`, `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout`). future: optional re-introduction of limited direct supabase usage if realtime features are required.
- **Data Layer**: External REST API calls to backend (`/api/*` base path) via centralized axios client with interceptors (auth token injection, error normalization, retry/backoff for idempotent GET)
- **State Management**: TanStack Query + React Context (auth) + local UI state; forms via React Hook Form + Zod
- **Rendering Strategy**: Server Components for public/static & SEO surfaces (skills list, courses listing); Client Components for authenticated & interactive flows (dashboards, test runner, forms). No custom Next.js API routes.
- **Internationalization**: Next.js i18n routing

### 1.1 Current Implemented Directory Structure

```
frontend/
	package.json
	src/
		app/
			[locale]/
				layout.tsx
				page.tsx                  # landing / placeholder
				auth/page.tsx
				register/page.tsx
				dashboard/page.tsx
				skills/page.tsx
				courses/page.tsx
			globals.css
		components/
			ui/
				Avatar.tsx
				Badge.tsx
				Button.tsx
				Card.tsx
				Input.tsx
				ThemeToggle.tsx
				LanguageSwitcher.tsx
				PageHeader.tsx
				PageLayout.tsx
				index.ts
			dashboard/
				AIWorkflowPrompt.tsx
				QuickActions.tsx
				EnrolledCourses.tsx
				LearningStats.tsx
			profile/
				EditProfileModal.tsx
			social/
				XPBar.tsx
			(other feature directories)
		context/
			AuthProvider.tsx
		lib/
			analytics.ts
			auth.ts
			http.ts
			queryKeys.ts
			theme.ts
			tokens.ts
			utils.ts
			validation.ts
			socialUtils.ts
		types/
			index.ts
		messages/
			(i18n translations)
```

### 1.2 Implemented vs Planned

| Area          | Implemented                                                         | Planned (future)                                     |
| ------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| auth          | backend token auth context, role-based access                       | role guard hooks, edge gating                        |
| data          | axios client, query keys, http interceptors                         | full query hooks per feature, optimistic flows       |
| ui primitives | button, input, card, badge, avatar, theme toggle, language switcher | full component library (forms, navigation, feedback) |
| pages public  | landing placeholder                                                 | marketing, public skills/courses detail              |
| pages private | dashboard, skills, courses, profile                                 | tests, recommendations, admin, instructor consoles   |
| social        | XP bar, profile toggle, client-side utils                           | quests panel, leaderboards, social dashboard         |
| theming       | light/dark toggle                                                   | design tokens + extended palette                     |
| analytics     | basic analytics module scaffold                                     | event taxonomy + providers                           |
| validation    | shared zod schemas                                                  | codegen from backend/openapi                         |
| i18n          | next-intl with locale routing                                       | additional language support                          |

## 2. Key User Personas & UX Goals

| Persona                 | Goals                                                     | Key Screens                                                          |
| ----------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| Anonymous Visitor       | Understand product, browse public skills/courses          | Marketing pages, public skill tree, public user profile minimal view |
| Learner (USER)          | Track skills, attempt tests, get recommendations, earn XP | Dashboard, Skill Detail, Course List, Recommendations, Tests, Social |
| Instructor (INSTRUCTOR) | Create / manage courses & tests                           | Instructor Console, Course Editor, Test Builder                      |
| Admin (ADMIN)           | Manage catalog, users, moderation, stats, quests          | Admin Console (Users, Skills CRUD, Courses CRUD, Reports, Quests)    |

## 3. Information Architecture & Routing Structure

Current implemented routes (subset): `/(root)`, `/[locale]/auth`, `/[locale]/register`, `/[locale]/dashboard`, `/[locale]/skills`, `/[locale]/courses`, `/[locale]/profile`.

The following is the planned expanded architecture (future):

```
src/app/
  [locale]/
    (public)/
      page.tsx                # Landing
      skills/
        page.tsx              # Skill list (public)
        [skillId]/page.tsx    # Skill detail (public + optional stats)
        hierarchy/page.tsx    # Skill tree view
      courses/
        page.tsx              # Public course explorer
        [courseId]/page.tsx   # Public course detail
      users/
        [userId]/page.tsx     # Public user profile (limited fields)
    (auth)/
      auth/page.tsx
      register/page.tsx
      callback/route.ts       # OAuth provider redirects (if enabled)
    (app)/                    # Authenticated layout (guards + nav)
      layout.tsx
      dashboard/page.tsx
      recommendations/page.tsx
      skills/
        [skillId]/page.tsx          # Extended detail inc. personal progress
        [skillId]/progression/page.tsx
      user/
        profile/page.tsx            # Own profile full
        skills/page.tsx             # Manage own skills
        bookmarks/page.tsx
        tests/page.tsx              # List attempts
      courses/
        page.tsx
        [courseId]/page.tsx
      tests/
        [testId]/page.tsx
        attempts/[attemptId]/page.tsx  # Attempt detail / resume
      social/                       # Social/Gamification features (opt-in)
        page.tsx                    # Social dashboard with quests + leaderboard preview
        leaderboard/page.tsx        # Full leaderboard with tabs
        quests/page.tsx             # All quests with details
        history/page.tsx            # XP transaction log
      admin/
        layout.tsx
        users/page.tsx
        skills/page.tsx
        skills/[skillId]/edit/page.tsx
        courses/page.tsx
        courses/[courseId]/edit/page.tsx
        tests/page.tsx
        quests/page.tsx             # Manage quests, award XP
        regions/page.tsx
        reports/page.tsx (future)
      instructor/
        courses/new/page.tsx
        courses/[courseId]/edit/page.tsx
        tests/new/page.tsx
        tests/[testId]/edit/page.tsx
```

Route Grouping Strategy (future):

- `(public)` – Marketing & browse
- `(auth)` – Public auth forms (no main app chrome)
- `(app)` – Private area: requires session
- Nested `admin` & `instructor` segments enforce role-based guards

## 4. Navigation & Layout System

Global shared components:

- `SiteHeader` (public nav + auth cta)
- `AppShell` (sidebar + top bar + responsive drawer)
- `AdminSidebar`, `InstructorSidebar`
- `Breadcrumbs` (derived from segment config)
- `UserMenu` (avatar, role badge, settings/logout)

Responsive breakpoints ensure mobile drawer nav for authenticated sections.

## 5. Authentication & Session Handling

Frontend uses only backend auth endpoints; backend internally integrates with supabase (opaque to client):

- Login: `POST /auth/login` returns `{ accessToken, refreshToken, user }`
- Me: `GET /auth/me` returns `{ user }` for profile refresh
- Refresh: `POST /auth/refresh` returns new tokens
- Logout: `POST /auth/logout` (best-effort on server; client also clears tokens)
- Tokens stored in `localStorage` (`auth_token`, `refresh_token`) and injected by axios interceptor.

Session Refresh Strategy:

- Attempt request; on 401 once, call refresh endpoint, retry original request.
- Scheduled silent refresh optional (future) based on token exp embedded claim if exposed by backend.

Role Guarding:

- `useRequireRole` (future) reads `user.role` from auth context.
- Protected layouts render skeleton/fallback while user state resolving.

## 6. Data Fetching & Caching

Use **TanStack Query** for client caching + background revalidation.

Query Key Conventions:

- `['skills', filters]`
- `['skill', skillId]`
- `['courses', filters]`
- `['course', courseId]`
- `['user', userId]` & `['user', userId, 'skills']`
- `['recommendations', userId]`
- `['tests', params]`, `['test', testId]`
- `['attempt', attemptId]`
- `['social', 'profile', userId]`
- `['social', 'quests', userId]`
- `['social', 'leaderboard', 'weekly', limit]`
- `['social', 'leaderboard', 'global', limit]`

Axios Client (`lib/http.ts`):

- Inject auth header via interceptor
- Normalize errors to `{ status, message, details }`
- Attach request ID header for tracing (`X-Request-Id` with nanoid)
- Retries (2) for network/5xx on idempotent GET requests

Optimistic Updates:

- Bookmark toggle: update `['course', id]` + `['bookmarks']`
- User skill progress patch: update `['skill', skillId]` & `['user', userId, 'skills']`

Server vs Client Data:

- Public non-personal pages (skills list, top courses) can be Server Components using `fetch` (no auth) with `revalidate = 300`
- Authenticated pages rely on client query hooks for instant reactivity
- Avoid duplicating logic; export plain functions that axios calls, used by both server & client when feasible

Error Handling:

- Interceptor rejects with normalized object; React Query `onError` triggers toast + optional Sentry capture (future)

Prefetch Strategy:

- On authenticated layout mount: prefetch user profile, user skills summary, bookmark count, recommendations placeholder

## 7. Forms & Validation

Libraries:

- `react-hook-form` + `@hookform/resolvers/zod` + shared Zod schemas (mirror backend shapes)
- Central schema file `lib/validation.ts` referencing backend contract (avoid duplication by exporting minimal shapes / or generating types via OpenAPI in future)

Patterns:

- Field components: `TextField`, `SelectField`, `NumberField`, `TagInput`, `SkillSelector`
- Form states: loading, success toast, error mapping from backend `details[]`

## 7.1. Social/Gamification System (Opt-In)

The frontend implements an opt-in social environment for learners who want gamification features.

### Implementation Status

**✅ Implemented:**

- Social toggle in profile settings (`EditProfileModal.tsx`)
- XP bar component with level, progress, and streak display (`XPBar.tsx`)
- Client-side XP calculation utilities (`lib/socialUtils.ts`)
- localStorage caching for social profile (60s TTL)
- Optimistic XP updates
- TypeScript types extended with social fields (`UserProfile`)

**📋 Planned:**

- Social dashboard page (`/[locale]/social`)
- Daily quests panel with progress tracking
- Leaderboard pages (weekly/global tabs)
- XP transaction history page
- Quest completion animations
- Level-up notifications

### Architecture

**Opt-In Model:**

- Default state: `user.socialEnabled = false`
- Toggle location: Profile settings modal (above Danger Zone)
- API endpoint: `PATCH /api/users/:id/social-toggle`
- Page reload after toggle to update global UI state

**XP Bar Component:**

- Location: Dashboard navbar (between language switcher and welcome message)
- Visibility: Only shown when `user.socialEnabled === true`
- Features:
  - Level badge with Zap icon
  - XP progress bar (current/needed XP)
  - Percentage display
  - Streak counter with Flame icon
- Updates: Fetches profile every 5 minutes, cached in component state

**Client-Side Utilities (`lib/socialUtils.ts`):**

```typescript
// XP calculations (matches backend formula)
getLevelFromXP(xp: number): number
getProgressToNextLevel(xp: number): {
  currentLevel, xpInCurrentLevel,
  xpNeededForNextLevel, progressPercentage
}
getTotalXPForLevel(level: number): number
getXPForLevel(level: number): number

// localStorage caching
cacheSocialProfile(userId: string, profile: SocialProfile): void
getCachedSocialProfile(userId: string, ttl?: number): SocialProfile | null
updateLocalXP(userId: string, xpGained: number): void
isSocialEnabled(): boolean
```

**Level Formula:**

```
XP for level N = 100 * (1.5 ^ (N - 1))
```

### API Integration

**Backend Endpoints:**

- `GET /api/social/profile` - User's social profile (cached 60s)
- `GET /api/social/quests/daily` - Daily quests with progress (cached 5min)
- `GET /api/social/leaderboard/weekly` - Top learners (cached 5min)
- `GET /api/social/leaderboard/global` - All-time rankings (cached 30min)
- `GET /api/social/xp/history` - Transaction log (paginated)
- `PATCH /api/users/:id/social-toggle` - Enable/disable social features

**Query Keys:**

- `['social', 'profile', userId]`
- `['social', 'quests', userId]`
- `['social', 'leaderboard', 'weekly', limit]`
- `['social', 'leaderboard', 'global', limit]`
- `['social', 'xp', userId, page]`

### Performance Optimizations

**Caching Strategy:**

- Backend Redis caching (tiered TTLs)
- Frontend localStorage caching (60s)
- Client-side XP calculations reduce server calls
- Optimistic UI updates before API confirmation

**XP Awards (Automatic):**

- Lesson completion: 20 XP
- Skill verification: 75 XP
- Course completion: 150 XP
- Quest completion: 10-150 XP (varies)
- Streak bonus: 50 XP per week (every 7 days)

### Future Enhancements

**Phase 2:**

- Social dashboard with quests + leaderboard preview
- Full leaderboard pages with filtering/sorting
- Quest details modal with rewards
- XP transaction history with filters
- Achievement badges system

**Phase 3:**

- Weekly challenges (special high-reward quests)
- Friend system (follow/compare progress)
- Team challenges (group competitions)
- Seasonal events (double XP weekends)
- Leaderboard tiers (Bronze/Silver/Gold/Platinum)

### UX Considerations

- **Non-intrusive**: Social features completely opt-in, hidden by default
- **Motivation**: XP and quests encourage consistent daily learning
- **Competition**: Leaderboards provide healthy competition
- **Progression**: Level system gives long-term goals
- **Feedback**: Immediate XP feedback after actions
- **Accessibility**: All social UI follows WCAG AA guidelines

## 8. UI Component Library (Planned)

Component Groups:

- Inputs: `TextInput`, `Textarea`, `Select`, `Toggle`, `Slider`, `CheckboxGroup`, `RadioGroup`
- Data Display: `StatCard`, `Badge`, `Avatar`, `ProgressBar`, `SkillChip`, `CourseCard`
- Navigation: `SidebarNav`, `TopNav`, `Tabs`, `Pagination`
- Feedback: `Toast`, `Modal`, `Alert`, `Skeleton`
- Complex: `SkillTree`, `CourseFilterPanel`, `TestQuestionRenderer`, `RecommendationList`

Styling Guidelines:

- Tailwind + small composition wrappers (avoid heavy design system overhead early)
- Design tokens: extend colors (brand blues/purples), spacing scale alignment

## 9. Pages & Feature Mapping

| Feature               | Backend Models/Endpoints                 | UI Components                                        | Notes                                |
| --------------------- | ---------------------------------------- | ---------------------------------------------------- | ------------------------------------ |
| Skill Browse          | `GET /api/skills`, hierarchy             | `SkillTree`, `SkillList`, `SearchBox`                | Tree cached (Redis future)           |
| Skill Detail          | `GET /api/skills/:id`                    | `SkillHeader`, `RelatedCourses`, `UserProgressPanel` | If auth → include personal progress  |
| User Skills Mgmt      | `/api/users/:id/skills` CRUD             | `UserSkillTable`, `SkillAddDialog`                   | Optimistic progress updates          |
| Courses Explorer      | `/api/courses`                           | `CourseFilters`, `CourseGrid`, `Pagination`          | Complex filter sidebar               |
| Course Detail         | `/api/courses/:id`                       | `CourseMeta`, `TagList`, `RelatedSkills`             | Bookmark button                      |
| Bookmarks             | `/api/users/:id/bookmarks`               | `BookmarkList`                                       | Sync after mutation                  |
| Tests List & Detail   | `/api/tests`, `/api/tests/:id`           | `TestList`, `TestQuestionRenderer`                   | Hide correct answers until submitted |
| Test Attempts         | `/api/tests/:id/attempts`, PATCH attempt | `AttemptProgress`, `AnswerForm`                      | Prevent duplicate incomplete         |
| Recommendations       | `/api/recommendations` + `/generate`     | `RecommendationList`, `GenerateButton`               | Show algorithm badges                |
| Regions & Competition | `/api/regions`                           | `RegionSelect`, `CompetitionChart`                   | Charts (Recharts) future             |
| Social Profile        | `GET /api/social/profile`                | `XPBar` (navbar), `SocialToggle` (profile)           | ✅ Implemented, cached 60s           |
| Daily Quests          | `GET /api/social/quests/daily`           | `QuestsPanel`, `QuestCard`                           | Planned, cached 5min                 |
| Leaderboards          | `GET /api/social/leaderboard/*`          | `LeaderboardTabs`, `LeaderboardRow`                  | Planned, cached 5-30min              |
| XP History            | `GET /api/social/xp/history`             | `XPTransactionList`                                  | Planned, paginated                   |
| Admin Skill CRUD      | `/api/skills` POST/PATCH                 | `SkillForm`                                          | Slug autogeneration                  |
| Admin Course CRUD     | `/api/courses` POST/PATCH                | `CourseForm`, `TagSelector`                          | ConnectOrCreate tags                 |
| Admin Users           | `/api/users`                             | `UserTable`                                          | Pagination, filters by role          |
| Admin Quests          | `/api/social/admin/quests` CRUD          | `QuestForm`, `QuestList`                             | Planned                              |

## 10. State & Data Modeling (Frontend)

Derived TypeScript interfaces (simplified) that map to backend outputs:

```ts
export interface UserProfile {
	id: string;
	supabaseId: string;
	email?: string;
	name?: string;
	headline?: string;
	bio?: string;
	role: "USER" | "INSTRUCTOR" | "ADMIN";
	regionId?: string;
	skills?: UserSkill[];
	// Social/gamification fields (opt-in)
	socialEnabled?: boolean;
	xp?: number;
	level?: number;
	currentStreak?: number;
}

export interface SocialProfile {
	user: {
		id: string;
		name: string | null;
		xp: number;
		level: number;
		currentStreak: number;
		longestStreak: number;
		lastActivityDate: string | null;
		currentLevel: number;
		xpInCurrentLevel: number;
		xpNeededForNextLevel: number;
		progressPercentage: number;
	};
}

export interface Quest {
	id: string;
	title: string;
	description: string;
	type:
		| "DAILY_LOGIN"
		| "COMPLETE_LESSON"
		| "COMPLETE_MULTIPLE_LESSONS"
		| "ADD_SKILL"
		| "VERIFY_SKILL"
		| "BOOKMARK_COURSE"
		| "COMPLETE_COURSE";
	xpReward: number;
	targetCount: number;
	progress: number;
	isCompleted: boolean;
}

export interface Skill {
	id: string;
	name: string;
	slug: string;
	description?: string;
	parentId?: string;
	children?: Skill[]; // for tree endpoints
}

export interface Course {
	id: string;
	title: string;
	description?: string;
	provider?: string;
	source: "INTERNAL" | "YOUTUBE" | "UDEMY" | "OTHER";
	difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
	isPaid: boolean;
	rating?: number;
	durationMinutes?: number;
	tags?: Tag[];
	skills?: CourseSkillLink[];
}

export interface Recommendation {
	id: string;
	algorithm: "RULES" | "CONTENT_BASED" | "COLLAB_FILTER" | "HYBRID";
	score: number;
	course?: Course;
	skill?: Skill;
	meta?: Record<string, unknown>;
}
```

(Additional: `Test`, `TestQuestion`, `TestAttempt`, `Region`, etc. to be added in code generation step.)

## 11. Access Control in UI

## 16. Theming & Accessibility

- Dark & Light mode implemented now via `next-themes` (class strategy, `html.dark`).
- Default theme configurable via env `NEXT_PUBLIC_DEFAULT_THEME` (`light` | `dark` | `system`).
- Provide `ThemeToggle` component for user switching; persist selection with localStorage (handled by library).
- Use semantic CSS variables layered on Tailwind tokens (e.g., `--bg-base`, `--fg-muted`).
- WCAG AA contrast for primary interactive states; validate with automated tooling.
- Keyboard navigable components; visible focus rings preserved (never removed globally).
- ARIA roles/labels for complex composites (SkillTree, Test Runner choices, Progress charts).
- Instructor creation tools conditionally rendered if role in `INSTRUCTOR` or `ADMIN`

## 17. Dependencies

```
@tanstack/react-query
@tanstack/react-query-devtools
axios
axios-retry
react-hook-form
zod
@hookform/resolvers
clsx
nprogress
recharts (planned)
react-hot-toast
lucide-react
next-themes
next-intl
dayjs
pluralize
nanoid
```

Notes:

- All core dependencies installed and in use
- `@supabase/*` packages not required in current frontend model; backend owns integration
- `recharts` planned for advanced analytics/charts visualization
- Social features use existing dependencies (no additional packages needed)

Performance considerations (planned):

- segment-level caching for future public server components via `revalidate`
- lazy loading for heavy modules (charts, test runner)
- minimize client hydration on static marketing pages

## 19. Example Axios Client Pattern

```ts
// lib/http.ts
import axios from "axios";
import axiosRetry from "axios-retry";
import { nanoid } from "nanoid";
import { getAccessToken } from "./auth";

export const http = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	timeout: 15000,
});

http.interceptors.request.use(async config => {
	config.headers["X-Request-Id"] = nanoid();
	const token = await getAccessToken();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

http.interceptors.response.use(
	r => r,
	async error => {
		const { response, config } = error;
		if (response?.status === 401 && !config._retry) {
			config._retry = true;
			const token = await getAccessToken(true);
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
				return http(config);
			}
		}
		throw {
			status: response?.status,
			message: response?.data?.error || response?.data?.message || error.message,
			details: response?.data?.details,
			path: response?.data?.path,
		};
	}
);

axiosRetry(http, {
	retries: 2,
	retryDelay: axiosRetry.exponentialDelay,
	retryCondition: err => !err.response || err.response.status >= 500,
});

export const getSkill = (id: string) => http.get(`/api/skills/${id}`).then(r => r.data);
```

```ts
import { useQuery } from "@tanstack/react-query";
import { getSkill } from "@/lib/http";

export function useSkill(skillId: string) {
	return useQuery({
		// Using tuple key for cache segmentation
		queryKey: ["skill", skillId],
		queryFn: () => getSkill(skillId),
		staleTime: 60_000,
	});
}
```

clsx

## 18. Environment Variables

Required (backend-only auth model):

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api   # backend base url
NEXT_PUBLIC_DEFAULT_THEME=light                     # light | dark | system
```

Optional (future / only if direct supabase realtime or storage features reintroduced):

```
NEXT_PUBLIC_SUPABASE_URL=...                        # unused currently
NEXT_PUBLIC_SUPABASE_ANON_KEY=...                   # unused currently
NEXT_PUBLIC_ANALYTICS_WRITE_KEY=...                 # future analytics provider
```

Rationale: frontend no longer initializes a supabase client; all auth/profile flows use backend token endpoints.

## 19. Directory Structure (Extended Proposal – Future)

```
src/
  app/ ... (as above)
  components/
    ui/ (primitive reusable components)
    layout/
    skills/
    courses/
    tests/
    recommendations/
    charts/
  lib/
    apiClient.ts
    supabaseClient.ts
    auth.ts
    queryKeys.ts
    validation.ts
    analytics.ts
  hooks/
    useAuth.ts
    useRequireRole.ts
    usePagination.ts
  context/
    AuthProvider.tsx
  styles/
    globals.css
  types/
    index.ts (shared interfaces)
```

## 20. Example API Client Pattern

```ts
// lib/apiClient.ts
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const token = await getAccessToken(); // from local storage/access token manager
	const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		},
		cache: "no-store",
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw error;
	}
	return res.json();
}
```

## 21. Example React Query Hook

```ts
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";

export function useSkill(skillId: string) {
	return useQuery({
		queryKey: ["skill", skillId],
		queryFn: () => apiFetch(`/api/skills/${skillId}`),
		staleTime: 60_000,
	});
}
```

## 22. Testing Strategy (Frontend)

Phase 1:

- Component tests: React Testing Library + Vitest/Jest
- Hooks tests (query hooks, auth guard)
- Accessibility snapshots via `jest-axe`

Phase 2:

- Playwright E2E: auth flow, skill add, test attempt, recommendation generation

## 23. Security Considerations

- Never trust client role; always verify via backend
- Strip secrets from client bundle (no direct supabase usage; only backend url exposed)
- CSRF not required for pure token-based API calls but ensure `sameSite` if cookies later

## 24. Migration & Future Enhancements

| Future Feature        | Notes                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| Soft Delete Awareness | UI badges for archived entities once backend adds soft deletes           |
| Offline / PWA         | Add service worker + precache critical routes                            |
| GraphQL Layer         | Potential codegen for type-safe queries                                  |
| Real-time Progress    | WebSocket / Supabase Realtime for test results or recommendation updates |
| Content Editor        | Rich text for course description                                         |
| Multi-language        | Duplicate content negotiation + skill translations                       |

## 25. Implementation Phases (Roadmap)

1. Core Auth + Layout + Query setup
2. Skills browse + detail + user skills management
3. Courses explorer + detail + bookmarks
4. Tests runner + attempts
5. Recommendations dashboard
6. Admin + Instructor consoles
7. Analytics, charts, performance passes
8. Polish: a11y, dark mode, SEO deepening

<!-- duplicate env vars section removed; consolidated in section 18 -->

## 26. Open Questions / Assumptions

- Assumes backend will expose CORS allowing frontend origin
- Assumes skill hierarchy endpoint returns nested `children[]`
- Assumes recommendation generation endpoint returns full course/skill objects when included
- Assumes tests endpoint hides `isCorrect` flags until submission (frontend must not rely on them pre-submit)

## 27. Minimal Auth Provider Sketch (Backend-Only Tokens)

```tsx
// context/AuthProvider.tsx
"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface UserProfile {
	id: string;
	name?: string;
	email?: string;
	role: string;
}

interface AuthState {
	user: UserProfile | null;
	loading: boolean;
	refreshing: boolean;
}

interface AuthContextValue extends AuthState {
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthContextValue | null>(null);

const ACCESS_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";

async function fetchProfile(token: string): Promise<UserProfile | null> {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: "no-store",
		});
		if (!res.ok) return null;
		const data = await res.json();
		return data.user as UserProfile;
	} catch {
		return null;
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		const token = localStorage.getItem(ACCESS_KEY);
		if (token) {
			const profile = await fetchProfile(token);
			setUser(profile);
		}
		setLoading(false);
	}, []);

	const refresh = useCallback(async () => {
		const refreshToken = localStorage.getItem(REFRESH_KEY);
		if (!refreshToken) return null;
		setRefreshing(true);
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refreshToken }),
			});
			if (!res.ok) throw new Error("refresh failed");
			const data = await res.json();
			if (data.accessToken) localStorage.setItem(ACCESS_KEY, data.accessToken);
			if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
			const profile = await fetchProfile(data.accessToken);
			setUser(profile);
			return profile;
		} catch {
			setUser(null);
			return null;
		} finally {
			setRefreshing(false);
		}
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});
		if (!res.ok) throw new Error("login failed");
		const data = await res.json();
		localStorage.setItem(ACCESS_KEY, data.accessToken);
		localStorage.setItem(REFRESH_KEY, data.refreshToken);
		setUser(data.user);
	}, []);

	const logout = useCallback(async () => {
		try {
			await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, { method: "POST" });
		} catch {}
		localStorage.removeItem(ACCESS_KEY);
		localStorage.removeItem(REFRESH_KEY);
		setUser(null);
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const value: AuthContextValue = { user, loading, refreshing, login, logout };
	return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthCtx);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
```

## 28. Design Principles

- Predictable: consistent navigation & form patterns
- Performant: avoid unnecessary client JS on static pages
- Accessible: semantic, keyboard-first, screen reader aware
- Incremental: deliver value each phase without over-engineering

## 29. Implementation Status Summary

### ✅ Completed Features

**Core Infrastructure:**

- Next.js 15 with App Router and Turbopack
- Tailwind CSS v4 with dark/light theme support
- Supabase Auth integration via backend
- Axios HTTP client with interceptors
- TanStack Query for data fetching
- React Hook Form + Zod validation
- next-intl for internationalization

**Authentication & User Management:**

- Login/Register flows
- Token management (access + refresh)
- AuthProvider context with localStorage persistence
- Protected route handling
- Profile management with edit modal
- Role-based access control (USER, INSTRUCTOR, ADMIN)

**Core Features:**

- Dashboard with learning stats
- Skills browsing and management
- Course exploration and enrollment
- User profile with skills display
- Bookmark system

**Social/Gamification (Opt-In):**

- Social environment toggle in profile settings
- XP bar component in navbar (level, progress, streak)
- Client-side XP calculation utilities
- localStorage caching with TTL
- Optimistic UI updates
- Extended UserProfile types with social fields

**UI Components:**

- Button, Input, Card, Badge, Avatar
- ThemeToggle, LanguageSwitcher
- PageHeader, PageLayout
- XPBar (social component)
- EditProfileModal with social toggle

### 📋 Planned Features

**Social/Gamification Phase 2:**

- Social dashboard (`/[locale]/social`)
- Daily quests panel with progress tracking
- Leaderboard pages (weekly/global tabs)
- XP transaction history
- Quest completion animations
- Level-up notifications

**Advanced Features:**

- Test runner and attempts tracking
- AI-powered recommendations UI
- Instructor course/test creation
- Admin panels (users, skills, courses, quests)
- Skill verification system UI
- Region-based competition charts

**Performance & Polish:**

- Server Components for public pages
- Prefetch strategies
- Advanced caching with Redis integration
- Loading skeletons and transitions
- Error boundaries
- Comprehensive toast notifications

---

**Last Updated:** November 17, 2025
**Version:** 2.0 (Social Features Update)

This document should be version-controlled and updated as implementation decisions are finalized. It serves as a blueprint for the engineering build-out of the SkillHub frontend aligned with the backend contracts.
