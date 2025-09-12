import { PrismaClient } from "@prisma/client";

// Create Prisma client with optimized settings
export const prisma = new PrismaClient({
	log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["warn", "error"],
});

// Query performance monitoring
if (process.env.NODE_ENV === "development") {
	prisma.$on("query", (e: any) => {
		if (e.duration > 1000) {
			console.log(`🐌 Slow Query (${e.duration}ms): ${e.query}`);
		} else if (e.duration > 500) {
			console.log(`⚠️  Query (${e.duration}ms): ${e.query.substring(0, 100)}...`);
		}
	});
}

// Connection management
export const connectDatabase = async () => {
	try {
		await prisma.$connect();
		console.log("✅ Database connected successfully");
	} catch (error) {
		console.error("❌ Database connection failed:", error);
		process.exit(1);
	}
};

export const disconnectDatabase = async () => {
	try {
		await prisma.$disconnect();
		console.log("📤 Database disconnected");
	} catch (error) {
		console.error("❌ Database disconnection error:", error);
	}
};

// Graceful shutdown
process.on("SIGINT", async () => {
	console.log("🔄 Graceful shutdown initiated...");
	await disconnectDatabase();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("🔄 Graceful shutdown initiated...");
	await disconnectDatabase();
	process.exit(0);
});

// Health check query
export const databaseHealthCheck = async (): Promise<boolean> => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return true;
	} catch (error) {
		console.error("Database health check failed:", error);
		return false;
	}
};

export default prisma;
