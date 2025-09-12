import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
	throw new Error("SUPABASE_URL environment variable is required");
}

if (!supabaseServiceKey) {
	throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required");
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

// Create a client for user session verification (without service role)
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
	throw new Error("SUPABASE_ANON_KEY environment variable is required");
}

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});
