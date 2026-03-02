import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(__dirname, "../../.env") });
dotenv.config();

// create prisma client with optimized settings
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL or DIRECT_URL must be set");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
	adapter,
	log:
		process.env.NODE_ENV === "development"
			? [
					{ emit: "event", level: "query" },
					{ emit: "stdout", level: "info" },
					{ emit: "stdout", level: "warn" },
					{ emit: "stdout", level: "error" },
				]
			: [{ emit: "stdout", level: "warn" }, { emit: "stdout", level: "error" }],
});

// query performance monitoring
if (process.env.NODE_ENV === "development") {
	prisma.$on("query", (e: any) => {
		if (e.duration > 1000) {
			console.log(`🐌 Slow Query (${e.duration}ms): ${e.query}`);
		} else if (e.duration > 500) {
			console.log(`⚠️  Query (${e.duration}ms): ${e.query.substring(0, 100)}...`);
		}
	});
}

// connection management
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

// graceful shutdown
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

// health check query
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
