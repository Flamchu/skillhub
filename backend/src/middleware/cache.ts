import { Request, Response, NextFunction } from "express";
import { redis, generateCacheKey, CACHE_TTL, isRedisAvailable } from "../config/redis";

// interface for cache options
interface CacheOptions {
	ttl?: number;
	keyGenerator?: (req: Request) => string;
	skipCache?: (req: Request) => boolean;
	onHit?: (key: string) => void;
	onMiss?: (key: string) => void;
}

// default key generator
const defaultKeyGenerator = (req: Request): string => {
	const { method, originalUrl, query } = req;
	const queryString = Object.keys(query).length > 0 ? JSON.stringify(query) : "";
	return generateCacheKey("api", method, originalUrl, queryString);
};

// cache middleware factory
export const cache = (options: CacheOptions = {}) => {
	const { ttl = CACHE_TTL.SHORT, keyGenerator = defaultKeyGenerator, skipCache = () => false, onHit, onMiss } = options;

	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// skip cache for non-get requests or when redis unavailable
			if (req.method !== "GET" || skipCache(req) || !redis || !isRedisAvailable) {
				return next();
			}

			const cacheKey = keyGenerator(req);

			// try to get cached response
			const cachedData = await redis.get(cacheKey);

			if (cachedData) {
				// cache hit
				onHit?.(cacheKey);

				const parsedData = JSON.parse(cachedData);

				// set cache headers
				res.set({
					"X-Cache": "HIT",
					"X-Cache-Key": cacheKey,
					"Cache-Control": `public, max-age=${ttl}`,
				});

				return res.json(parsedData);
			}

			// cache miss - intercept response to cache it
			onMiss?.(cacheKey);

			const originalSend = res.json;
			let responseData: any;

			res.json = function (data: any) {
				responseData = data;
				return originalSend.call(this, data);
			};

			// continue with request processing
			res.on("finish", async () => {
				try {
					// only cache successful responses (2xx status codes) and if redis is available
					if (res.statusCode >= 200 && res.statusCode < 300 && responseData && redis && isRedisAvailable) {
						await redis.setex(cacheKey, ttl, JSON.stringify(responseData));

						// set cache headers for next time
						res.set({
							"X-Cache": "MISS",
							"X-Cache-Key": cacheKey,
							"Cache-Control": `public, max-age=${ttl}`,
						});
					}
				} catch (error) {
					console.error("Cache storage error:", error);
					// don't fail the request if caching fails
				}
			});

			next();
		} catch (error) {
			console.error("Cache middleware error:", error);
			// continue without caching if redis is down
			next();
		}
	};
};

// cache invalidation helper
export const invalidateCache = async (pattern: string): Promise<void> => {
	try {
		// skip invalidation if redis not available
		if (!redis || !isRedisAvailable) {
			return;
		}

		const keys = await redis.keys(pattern);
		if (keys.length > 0) {
			await redis.del(...keys);
			console.log(`🗑️  Invalidated ${keys.length} cache entries matching: ${pattern}`);
		}
	} catch (error) {
		console.error("Cache invalidation error:", error);
	}
};

// cache invalidation middleware for write operations
export const invalidateCacheMiddleware = (patterns: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const originalSend = res.json;

		res.json = function (data: any) {
			const result = originalSend.call(this, data);

			// invalidate cache after successful write operations
			if (res.statusCode >= 200 && res.statusCode < 300) {
				patterns.forEach((pattern) => {
					invalidateCache(pattern).catch((error) => {
						console.error("Failed to invalidate cache pattern:", pattern, error);
					});
				});
			}

			return result;
		};

		next();
	};
};

// predefined cache configurations for common use cases
export const cacheConfigs = {
	// long-term cache for relatively static data
	skillsHierarchy: {
		ttl: CACHE_TTL.LONG,
		keyGenerator: () => generateCacheKey("skills", "hierarchy", "tree"),
		onHit: () => console.log("💾 Cache HIT: Skills hierarchy"),
		onMiss: () => console.log("💥 Cache MISS: Skills hierarchy"),
	},

	// medium-term cache for skill lists
	skillsList: {
		ttl: CACHE_TTL.MEDIUM,
		keyGenerator: (req: Request) => {
			const { includeChildren, parentId, search, sortBy, sortOrder } = req.query;
			return generateCacheKey("skills", "list", String(includeChildren || ""), String(parentId || ""), String(search || ""), String(sortBy || ""), String(sortOrder || ""));
		},
		onHit: (key: string) => console.log("💾 Cache HIT: Skills list", key.split(":").slice(-3).join(":")),
		onMiss: (key: string) => console.log("💥 Cache MISS: Skills list", key.split(":").slice(-3).join(":")),
	},

	// short-term cache for course listings (frequently updated)
	coursesList: {
		ttl: CACHE_TTL.SHORT,
		keyGenerator: (req: Request) => {
			const { skillId, tag, difficulty, freeOnly, provider, source, page, limit } = req.query;
			return generateCacheKey("courses", "list", String(skillId || ""), String(tag || ""), String(difficulty || ""), String(freeOnly || ""), String(provider || ""), String(source || ""), String(page || "1"), String(limit || "20"));
		},
		onHit: () => console.log("💾 Cache HIT: Courses list"),
		onMiss: () => console.log("💥 Cache MISS: Courses list"),
	},

	// long-term cache for regions (rarely change)
	regionsList: {
		ttl: CACHE_TTL.VERY_LONG,
		keyGenerator: (req: Request) => {
			const { page, limit } = req.query;
			return generateCacheKey("regions", "list", String(page || "1"), String(limit || "20"));
		},
		onHit: () => console.log("💾 Cache HIT: Regions list"),
		onMiss: () => console.log("💥 Cache MISS: Regions list"),
	},

	// medium-term cache for user profiles
	userProfile: {
		ttl: CACHE_TTL.MEDIUM,
		keyGenerator: (req: Request) => generateCacheKey("user", "profile", req.params.id),
		skipCache: (req: Request) => {
			// skip cache for authenticated requests to own profile
			const authHeader = req.headers["authorization"];
			return !!authHeader;
		},
		onHit: () => console.log("💾 Cache HIT: User profile"),
		onMiss: () => console.log("💥 Cache MISS: User profile"),
	},
};
