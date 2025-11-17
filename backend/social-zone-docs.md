# social zone - complete gamification environment

## overview

the social zone is a completely separate gamification environment within skillhub. it's an **opt-in system** where users can enable social features from their profile settings (disabled by default).

## architecture

### opt-in model

- users must explicitly enable `socialEnabled` in their profile settings
- all social features are hidden from users who haven't opted in
- backend middleware (`requireSocialEnabled`) protects social endpoints
- frontend components check `user.socialEnabled` before rendering

### frontend structure

#### dashboard integration

- `/dashboard` shows `SocialZoneCard` component (only visible if social enabled)
- card provides quick access to all social tabs
- xp bar in navbar shows live progress (only visible if social enabled)

#### social page structure

- `/social` - main social zone page with tab navigation
- `/social?tab=dashboard` - social dashboard with stats and quest preview
- `/social?tab=leaderboard` - weekly and all-time leaderboards
- `/social?tab=quests` - daily quests with progress tracking
- `/social?tab=profile` - user's social profile and xp history

### components

#### `/components/dashboard/SocialZoneCard.tsx`

- visible only to users with `socialEnabled: true`
- shows 4 quick action buttons (dashboard, leaderboard, quests, profile)
- provides "enter social zone" button to navigate to `/social`

#### `/components/social/SocialDashboard.tsx`

- displays level, xp, and streak stats
- shows today's quest progress
- provides overview of user's social standing

#### `/components/social/SocialLeaderboard.tsx`

- toggle between weekly and all-time leaderboards
- shows top 50 users with rank, level, xp, and streak
- medal icons for top 3 ranks
- public endpoint (no auth required)

#### `/components/social/SocialQuests.tsx`

- displays daily quests with progress bars
- separates active and completed quests
- shows xp rewards for each quest
- auto-refreshes every minute

#### `/components/social/SocialProfile.tsx`

- user's complete social profile
- stats: level, total xp, current streak, longest streak
- xp history with transaction details
- formatted timestamps ("5m ago", "2h ago", etc)

### backend routes

all routes are under `/api/social/*`

#### public routes

- `GET /leaderboard/weekly` - weekly top performers
- `GET /leaderboard/global` - all-time champions

#### protected routes (require authentication + social enabled)

- `GET /profile` - user's gamification profile
- `GET /quests/daily` - user's daily quests
- `GET /xp/history` - user's xp transaction history

#### admin routes (require authentication + admin role)

- `POST /xp/award` - manually award xp to a user
- `GET /quests/admin` - list all quests
- `POST /quests` - create new quest
- `PATCH /quests/:id` - update quest
- `DELETE /quests/:id` - delete quest
- `POST /quests/seed` - seed initial quests
- `GET /stats/quests` - quest completion statistics

### middleware

#### `/middleware/socialEnabled.ts`

- checks if user has `socialEnabled: true`
- must be used after `authenticateSupabaseToken`
- returns 403 with helpful message if social not enabled
- protects endpoints that require social features

### caching strategy

redis caching with tiered ttls:

- social profile: 60s (very dynamic)
- daily quests: 5min (updates throughout day)
- weekly leaderboard: 5min (competitive, needs freshness)
- global leaderboard: 10min (changes less frequently)

cache keys are generated per user for personalized data.

### xp system

#### sources

- `QUEST_COMPLETION` - completing daily quests
- `COURSE_COMPLETION` - finishing a course
- `LESSON_COMPLETION` - completing a lesson
- `SKILL_VERIFICATION` - passing skill verification
- `DAILY_LOGIN` - logging in daily
- `STREAK_BONUS` - maintaining activity streak
- `ADMIN_GRANT` - manual xp from admin

#### level progression

- exponential growth formula: `100 * 1.5^(level-1)`
- level 1→2: 100 xp
- level 2→3: 150 xp
- level 3→4: 225 xp
- etc.

#### calculations

all xp calculations happen on both:

- backend (authoritative, handles awards)
- frontend (display, reduces server load)

formulas in:

- backend: `/services/socialService.ts`
- frontend: `/lib/socialUtils.ts`

### quest system

#### types

quests are defined by `QuestType` enum in prisma:

- `COMPLETE_LESSON` - finish any lesson
- `COMPLETE_COURSE` - finish any course
- `VERIFY_SKILL` - pass skill verification
- `LOGIN_STREAK` - maintain daily login
- custom types can be added

#### mechanics

- quests reset daily (00:00 UTC)
- progress tracked in `QuestCompletion` table
- automatic progress updates via `checkQuestProgress()` service
- xp awarded on completion

#### seeding

initial quests created via `/social/quests/seed` endpoint (admin only)

### streak system

#### logic

- increments on daily activity
- breaks if >1 day gap
- tracks `currentStreak` and `longestStreak`
- updates `lastActivityDate` on any xp-earning action

#### bonuses

- streak maintenance can award bonus xp
- visual indicators (flame icon) in ui

## ui/ux design

### visual identity

- primary color gradient (primary → purple → pink)
- consistent iconography (lucide-react icons)
- glass morphism effects (backdrop blur, transparency)
- smooth animations and transitions

### responsive design

- mobile-first approach
- grid layouts adapt to screen size
- touch-friendly tap targets

### accessibility

- semantic html
- clear contrast ratios
- descriptive labels

## user flow

### enabling social features

1. user goes to profile settings
2. toggles "enable social environment" switch
3. frontend updates `user.socialEnabled` via api
4. social zone card appears on dashboard
5. xp bar appears in navbar

### typical usage

1. user logs in (daily login xp + streak update)
2. views dashboard, sees social zone card
3. clicks "enter social zone"
4. checks daily quests on dashboard tab
5. completes learning activities (earns xp)
6. checks leaderboard to see ranking
7. views profile to see xp history

### competitive aspect

- weekly leaderboard resets every week
- global leaderboard is all-time cumulative
- users can see their rank and compare with others
- no direct pvp, just friendly competition

## technical considerations

### performance

- redis caching reduces database load
- client-side xp calculations reduce api calls
- localstorage caching in `socialUtils.ts`
- lazy loading of social components

### scalability

- paginated xp history
- limited leaderboard results (top 50)
- efficient database queries with proper indexes
- cache invalidation on user actions

### security

- all protected routes require authentication
- social-specific routes require `socialEnabled` check
- admin routes require admin role
- input validation on all endpoints

## future enhancements

potential features:

- achievements/badges system
- friend system (follow other users)
- quest chains (multi-day quests)
- seasonal events
- social feed (activity stream)
- user-to-user challenges
- guild/team system
- personalized quest recommendations
- xp multipliers for specific skills
- daily/weekly challenges beyond quests

## maintenance

### adding new xp sources

1. add to `XPSource` enum in prisma schema
2. update icon mapping in `SocialProfile.tsx`
3. update format function if needed
4. call `awardXP()` from relevant service

### adding new quest types

1. add to `QuestType` enum in prisma schema
2. create quest via admin endpoint
3. implement progress tracking logic
4. test quest completion flow

### monitoring

- check redis cache hit rates
- monitor leaderboard query performance
- track quest completion rates
- analyze xp distribution across sources

## api integration

### checking if social enabled

```typescript
import { useAuth } from "@/context/AuthProvider";

const { user } = useAuth();
if (user?.socialEnabled) {
	// show social features
}
```

### fetching social data

```typescript
const token = localStorage.getItem("auth_token");
const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/social/profile`, {
	headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
```

### awarding xp (backend)

```typescript
import { awardXP } from "../services/socialService";
import { XPSource } from "@prisma/client";

await awardXP(userId, 50, XPSource.LESSON_COMPLETION, "completed python basics");
```

## troubleshooting

### social features not showing

- check `user.socialEnabled` in auth context
- verify profile settings toggle works
- check backend `/auth/me` returns `socialEnabled: true`

### xp not updating

- check redis is running
- verify cache invalidation on awards
- check xp transaction created in database

### quest progress not tracking

- verify quest is active (`isActive: true`)
- check `checkQuestProgress()` called after action
- ensure `QuestCompletion` record exists for user

### leaderboard not loading

- check public endpoints don't require auth for global view
- verify cache timeout settings
- check database query performance
