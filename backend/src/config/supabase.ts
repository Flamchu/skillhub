import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// load .env (idempotent)
dotenv.config({ quiet: true });

// supabase client container
interface SupabaseClients {
	admin?: SupabaseClient;
	auth?: SupabaseClient;
	configured: boolean;
	reason?: string;
}

const clients: SupabaseClients = { configured: false };

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY"] as const;

const missing = required.filter((k) => !process.env[k]);

// allow disabling supabase for local/dev
const SUPABASE_DISABLED = process.env.SUPABASE_DISABLED === "true";

if (missing.length === 0 && !SUPABASE_DISABLED) {
	const supabaseUrl = process.env.SUPABASE_URL!;
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
	const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

	clients.admin = createClient(supabaseUrl, supabaseServiceKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});

	clients.auth = createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});

	clients.configured = true;
} else {
	if (SUPABASE_DISABLED) {
		clients.reason = "supabase disabled via SUPABASE_DISABLED=true";
	} else {
		clients.reason = `missing supabase env vars: ${missing.join(", ")}`;
	}
	if (process.env.NODE_ENV !== "test" && !SUPABASE_DISABLED) {
		// throw in non-test when misconfigured
		throw new Error(clients.reason);
	} else {
		console.warn(`supabase not configured: ${clients.reason}`);
	}
}

// exports (backwards compatible)
export const supabase = clients.admin as SupabaseClient;
export const supabaseAuth = clients.auth as SupabaseClient;

export default supabase;
