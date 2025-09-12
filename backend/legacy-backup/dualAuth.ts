import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, AuthenticatedUser } from "./supabaseAuth";
import { authenticateSupabaseToken } from "./supabaseAuth";
import { authenticateToken } from "./auth";

/**
 * Dual authentication middleware that supports both JWT and Supabase tokens
 * during the migration period. Tries Supabase first, then falls back to JWT.
 */
export const authenticateDual = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		res.status(401).json({ error: "Access token required" });
		return;
	}

	// Try Supabase authentication first
	try {
		await authenticateSupabaseToken(req, res, () => {
			// If Supabase auth succeeds, continue
			if (req.user) {
				next();
			} else {
				// If no user was set, try JWT fallback
				tryJWTAuth(req, res, next);
			}
		});
	} catch (error) {
		// If Supabase auth fails, try JWT authentication
		tryJWTAuth(req, res, next);
	}
};

const tryJWTAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	try {
		await authenticateToken(req, res, next);
	} catch (error) {
		// If both methods fail, return authentication error
		res.status(401).json({ error: "Invalid or expired token" });
	}
};

/**
 * Checks if the authenticated user is using Supabase Auth
 */
export const isSupabaseUser = (user: AuthenticatedUser): boolean => {
	return !!(user as any).supabaseId;
};

/**
 * Gets the user ID that should be used for database queries
 * (handles both Supabase and JWT users)
 */
export const getUserId = (user: AuthenticatedUser): string => {
	return user.id;
};
