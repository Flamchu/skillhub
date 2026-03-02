import { defineConfig } from "prisma/config";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvFile(path: string): void {
	if (!existsSync(path)) return;

	const raw = readFileSync(path, "utf8");
	for (const line of raw.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const eqIndex = trimmed.indexOf("=");
		if (eqIndex === -1) continue;

		const key = trimmed.slice(0, eqIndex).trim();
		let value = trimmed.slice(eqIndex + 1).trim();

		if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}

		if (!(key in process.env)) {
			process.env[key] = value;
		}
	}
}

// load env from backend/.env first, then root .env as fallback
loadEnvFile(join(process.cwd(), ".env"));
loadEnvFile(join(process.cwd(), "..", ".env"));

const runtimeUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
const migrationsUrl = process.env.DIRECT_URL || process.env.PRISMA_MIGRATIONS_URL || runtimeUrl;

export default defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		url: migrationsUrl,
	},
});
