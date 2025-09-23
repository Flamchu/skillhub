import dotenv from "dotenv";
import { z } from "zod";

// load .env
dotenv.config();

// env schema
const EnvSchema = z.object({
	NODE_ENV: z.string().default("development"),
	PORT: z.string().optional(),
	DATABASE_URL: z.url().optional(),
	SUPABASE_URL: z.url().optional(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
	SUPABASE_ANON_KEY: z.string().optional(),
	SUPABASE_DISABLED: z.enum(["true", "false"]).optional(),
	HUGGINGFACE_API_KEY: z.string().optional(), // for AI summarization (optional, will use public API if not provided)
	REDIS_ENABLED: z.string().optional(),
	REDIS_HOST: z.string().optional(),
	REDIS_PORT: z.string().optional(),
	REDIS_PASSWORD: z.string().optional(),
	REDIS_DB: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("invalid environment configuration:");
	for (const issue of parsed.error.issues) {
		console.error(` - ${issue.path.join(".")}: ${issue.message}`);
	}
}

export const env: Env = parsed.success ? parsed.data : (process.env as any);

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
export const isDevelopment = !isProduction && !isTest;
