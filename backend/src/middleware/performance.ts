import { Request, Response, NextFunction } from "express";
import responseTime from "response-time";

// interface for performance metrics
interface PerformanceMetrics {
	timestamp: Date;
	method: string;
	path: string;
	statusCode: number;
	responseTime: number;
	userAgent?: string;
	cacheHit?: boolean;
	queryCount?: number;
}

// store for recent performance metrics (in production, send to monitoring service)
const recentMetrics: PerformanceMetrics[] = [];
const MAX_STORED_METRICS = 1000;

// performance thresholds
const PERFORMANCE_THRESHOLDS = {
	SLOW_QUERY: 1000, // 1 second
	VERY_SLOW_QUERY: 3000, // 3 seconds
	WARNING_THRESHOLD: 500, // 500ms
} as const;

// performance monitoring middleware
export const performanceMonitoring = responseTime((req: Request, res: Response, time: number) => {
	const metrics: PerformanceMetrics = {
		timestamp: new Date(),
		method: req.method,
		path: req.path,
		statusCode: res.statusCode,
		responseTime: time,
		userAgent: req.get("User-Agent"),
		cacheHit: res.get("X-Cache") === "HIT",
	};

	// add to recent metrics
	recentMetrics.push(metrics);
	if (recentMetrics.length > MAX_STORED_METRICS) {
		recentMetrics.shift();
	}

	// log slow queries
	if (time > PERFORMANCE_THRESHOLDS.VERY_SLOW_QUERY) {
		console.error(`🐌 VERY SLOW REQUEST: ${req.method} ${req.path} - ${time.toFixed(2)}ms`);
	} else if (time > PERFORMANCE_THRESHOLDS.SLOW_QUERY) {
		console.warn(`⚠️  SLOW REQUEST: ${req.method} ${req.path} - ${time.toFixed(2)}ms`);
	} else if (time > PERFORMANCE_THRESHOLDS.WARNING_THRESHOLD) {
		console.log(`⏱️  REQUEST: ${req.method} ${req.path} - ${time.toFixed(2)}ms`);
	}

	// log cache performance
	if (metrics.cacheHit) {
		console.log(`💨 FAST (cached): ${req.method} ${req.path} - ${time.toFixed(2)}ms`);
	}
});

// prisma query counting middleware
export const queryCounter = (req: Request, res: Response, next: NextFunction) => {
	// requires prisma middleware to track query count - placeholder for now
	(req as any).queryCount = 0;
	next();
};

// get performance metrics
export const getPerformanceMetrics = () => {
	const now = Date.now();
	const oneHourAgo = now - 60 * 60 * 1000;
	const oneDayAgo = now - 24 * 60 * 60 * 1000;

	const recentHour = recentMetrics.filter((m) => m.timestamp.getTime() > oneHourAgo);
	const recentDay = recentMetrics.filter((m) => m.timestamp.getTime() > oneDayAgo);

	const calculateStats = (metrics: PerformanceMetrics[]) => {
		if (metrics.length === 0) return null;

		const responseTimes = metrics.map((m) => m.responseTime);
		const sortedTimes = responseTimes.sort((a, b) => a - b);

		return {
			totalRequests: metrics.length,
			averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / metrics.length,
			medianResponseTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
			p95ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
			p99ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
			slowQueries: metrics.filter((m) => m.responseTime > PERFORMANCE_THRESHOLDS.SLOW_QUERY).length,
			cacheHitRate: metrics.filter((m) => m.cacheHit).length / metrics.length,
			errorRate: metrics.filter((m) => m.statusCode >= 400).length / metrics.length,
		};
	};

	return {
		lastHour: calculateStats(recentHour),
		lastDay: calculateStats(recentDay),
		totalTracked: recentMetrics.length,
	};
};

// performance endpoint for monitoring
export const performanceEndpoint = (req: Request, res: Response) => {
	const metrics = getPerformanceMetrics();

	res.json({
		performance: metrics,
		thresholds: PERFORMANCE_THRESHOLDS,
		timestamp: new Date().toISOString(),
	});
};

// health check with performance info
export const healthCheck = async (req: Request, res: Response) => {
	const startTime = Date.now();

	// basic health checks
	const health = {
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		memory: process.memoryUsage(),
		responseTime: 0,
	};

	health.responseTime = Date.now() - startTime;

	res.json(health);
};
