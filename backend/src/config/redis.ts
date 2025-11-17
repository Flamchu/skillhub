import Redis from "ioredis";

// check if redis should be enabled
const REDIS_ENABLED = process.env.REDIS_ENABLED !== "false" && process.env.NODE_ENV !== "test";

// redis configuration
const redisConfig = {
	host: process.env.REDIS_HOST || "localhost",
	port: parseInt(process.env.REDIS_PORT || "6379"),
	password: process.env.REDIS_PASSWORD,
	db: parseInt(process.env.REDIS_DB || "0"),
	retryDelayOnFailover: 100,
	maxRetriesPerRequest: 1, // fail fast if redis not available
	lazyConnect: true,
	keepAlive: 30000,
	family: 4, // use ipv4
	commandTimeout: 3000,
	connectTimeout: 3000,
};

// create redis client only if enabled
export const redis = REDIS_ENABLED ? new Redis(redisConfig) : null;

// track redis availability
export let isRedisAvailable = false;

// redis connection event handlers (only if redis enabled)
if (redis) {
	redis.on("connect", () => {
		console.log("📡 Redis connected");
		isRedisAvailable = true;
	});

	redis.on("ready", () => {
		console.log("✅ Redis ready");
		isRedisAvailable = true;
	});

	redis.on("error", (error) => {
		console.error("❌ Redis error:", error);
		isRedisAvailable = false;
	});

	redis.on("close", () => {
		console.log("🔴 Redis connection closed");
		isRedisAvailable = false;
	});

	redis.on("reconnecting", () => {
		console.log("🔄 Redis reconnecting...");
		isRedisAvailable = false;
	});
} else {
	console.log("⚠️  Redis disabled - caching will be skipped");
}

// graceful shutdown
process.on("SIGINT", async () => {
	if (redis) await redis.quit();
});

process.on("SIGTERM", async () => {
	if (redis) await redis.quit();
});

// cache key generators
export const generateCacheKey = (prefix: string, ...params: string[]): string => {
	return `${prefix}:${params.join(":")}`;
};

// cache ttl constants (in seconds)
export const CACHE_TTL = {
	SHORT: 5 * 60, // 5 minutes
	MEDIUM: 30 * 60, // 30 minutes
	LONG: 2 * 60 * 60, // 2 hours
	VERY_LONG: 24 * 60 * 60, // 24 hours
} as const;

// cache prefixes
export const CACHE_KEYS = {
	SKILLS_HIERARCHY: "skills:hierarchy",
	SKILLS_LIST: "skills:list",
	COURSES_LIST: "courses:list",
	COURSE_DETAIL: "course:detail",
	USER_PROFILE: "user:profile",
	REGIONS_LIST: "regions:list",
	SKILL_STATS: "skill:stats",
	USER_SKILLS: "user:skills",
	RECOMMENDATIONS: "recommendations",
	USER_ENROLLMENTS: "user:enrollments",
	USER_PROGRESS: "user:progress",
	COURSE_PROGRESS: "course:progress",
	SOCIAL_PROFILE: "social:profile",
	DAILY_QUESTS: "social:quests:daily",
	WEEKLY_LEADERBOARD: "social:leaderboard:weekly",
	GLOBAL_LEADERBOARD: "social:leaderboard:global",
	XP_HISTORY: "social:xp:history",
} as const;

export default redis;
