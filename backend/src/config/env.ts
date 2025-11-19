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
	LOCAL_AI_SERVICE_URL: z.string().optional(), // local ai service url
	AI_SERVICE_ENABLED: z.enum(["true", "false"]).optional(), // enable/disable ai service
	REDIS_ENABLED: z.string().optional(),
	REDIS_HOST: z.string().optional(),
	REDIS_PORT: z.string().optional(),
	REDIS_PASSWORD: z.string().optional(),
	REDIS_DB: z.string().optional(),
	S3_ENDPOINT: z.string().optional(),
	S3_REGION: z.string().optional(),
	S3_ACCESS_KEY_ID: z.string().optional(),
	S3_SECRET_ACCESS_KEY: z.string().optional(),
	S3_BUCKET: z.string().optional(),
	S3_PUBLIC_URL: z.string().optional(),
	S3_FORCE_PATH_STYLE: z.string().optional(),
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
