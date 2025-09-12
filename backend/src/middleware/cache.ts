import { Request, Response, NextFunction } from "express";
import { redis, generateCacheKey, CACHE_TTL, isRedisAvailable } from "../config/redis";

// Interface for cache options
interface CacheOptions {
	ttl?: number;
	keyGenerator?: (req: Request) => string;
	skipCache?: (req: Request) => boolean;
	onHit?: (key: string) => void;
	onMiss?: (key: string) => void;
}

// Default key generator
const defaultKeyGenerator = (req: Request): string => {
	const { method, originalUrl, query } = req;
	const queryString = Object.keys(query).length > 0 ? JSON.stringify(query) : "";
	return generateCacheKey("api", method, originalUrl, queryString);
};

/**
 * Cache middleware factory
 * @param options Cache configuration options
 * @returns Express middleware function
 */
export const cache = (options: CacheOptions = {}) => {
	const { ttl = CACHE_TTL.SHORT, keyGenerator = defaultKeyGenerator, skipCache = () => false, onHit, onMiss } = options;

	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Skip cache for non-GET requests, when skipCache returns true, or when Redis is not available
			if (req.method !== "GET" || skipCache(req) || !redis || !isRedisAvailable) {
				return next();
			}

			const cacheKey = keyGenerator(req);

			// Try to get cached response
			const cachedData = await redis.get(cacheKey);

			if (cachedData) {
				// Cache hit
				onHit?.(cacheKey);

				const parsedData = JSON.parse(cachedData);

				// Set cache headers
				res.set({
					"X-Cache": "HIT",
					"X-Cache-Key": cacheKey,
					"Cache-Control": `public, max-age=${ttl}`,
				});

				return res.json(parsedData);
			}

			// Cache miss - intercept response to cache it
			onMiss?.(cacheKey);

			const originalSend = res.json;
			let responseData: any;

			res.json = function (data: any) {
				responseData = data;
				return originalSend.call(this, data);
			};

			// Continue with request processing
			res.on("finish", async () => {
				try {
					// Only cache successful responses (2xx status codes) and if Redis is available
					if (res.statusCode >= 200 && res.statusCode < 300 && responseData && redis && isRedisAvailable) {
						await redis.setex(cacheKey, ttl, JSON.stringify(responseData));

						// Set cache headers for next time
						res.set({
							"X-Cache": "MISS",
							"X-Cache-Key": cacheKey,
							"Cache-Control": `public, max-age=${ttl}`,
						});
					}
				} catch (error) {
					console.error("Cache storage error:", error);
					// Don't fail the request if caching fails
				}
			});

			next();
		} catch (error) {
			console.error("Cache middleware error:", error);
			// Continue without caching if Redis is down
			next();
		}
	};
};

/**
 * Cache invalidation helper
 * @param pattern Redis key pattern to invalidate
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
	try {
		// Skip invalidation if Redis is not available
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

/**
 * Cache invalidation middleware for write operations
 * @param patterns Array of cache patterns to invalidate
 */
export const invalidateCacheMiddleware = (patterns: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const originalSend = res.json;

		res.json = function (data: any) {
			const result = originalSend.call(this, data);

			// Invalidate cache after successful write operations
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

/**
 * Predefined cache configurations for common use cases
 */
export const cacheConfigs = {
	// Long-term cache for relatively static data
	skillsHierarchy: {
		ttl: CACHE_TTL.LONG,
		keyGenerator: () => generateCacheKey("skills", "hierarchy", "tree"),
		onHit: () => console.log("💾 Cache HIT: Skills hierarchy"),
		onMiss: () => console.log("💥 Cache MISS: Skills hierarchy"),
	},

	// Medium-term cache for skill lists
	skillsList: {
		ttl: CACHE_TTL.MEDIUM,
		keyGenerator: (req: Request) => {
			const { includeChildren, parentId, search, sortBy, sortOrder } = req.query;
			return generateCacheKey("skills", "list", String(includeChildren || ""), String(parentId || ""), String(search || ""), String(sortBy || ""), String(sortOrder || ""));
		},
		onHit: (key: string) => console.log("💾 Cache HIT: Skills list", key.split(":").slice(-3).join(":")),
		onMiss: (key: string) => console.log("💥 Cache MISS: Skills list", key.split(":").slice(-3).join(":")),
	},

	// Short-term cache for course listings (frequently updated)
	coursesList: {
		ttl: CACHE_TTL.SHORT,
		keyGenerator: (req: Request) => {
			const { skillId, tag, difficulty, freeOnly, provider, source, page, limit } = req.query;
			return generateCacheKey("courses", "list", String(skillId || ""), String(tag || ""), String(difficulty || ""), String(freeOnly || ""), String(provider || ""), String(source || ""), String(page || "1"), String(limit || "20"));
		},
		onHit: () => console.log("💾 Cache HIT: Courses list"),
		onMiss: () => console.log("💥 Cache MISS: Courses list"),
	},

	// Long-term cache for regions (rarely change)
	regionsList: {
		ttl: CACHE_TTL.VERY_LONG,
		keyGenerator: (req: Request) => {
			const { page, limit } = req.query;
			return generateCacheKey("regions", "list", String(page || "1"), String(limit || "20"));
		},
		onHit: () => console.log("💾 Cache HIT: Regions list"),
		onMiss: () => console.log("💥 Cache MISS: Regions list"),
	},

	// Medium-term cache for user profiles
	userProfile: {
		ttl: CACHE_TTL.MEDIUM,
		keyGenerator: (req: Request) => generateCacheKey("user", "profile", req.params.id),
		skipCache: (req: Request) => {
			// Skip cache for authenticated requests to own profile
			const authHeader = req.headers["authorization"];
			return !!authHeader;
		},
		onHit: () => console.log("💾 Cache HIT: User profile"),
		onMiss: () => console.log("💥 Cache MISS: User profile"),
	},
};
