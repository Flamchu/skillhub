import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { supabase, supabaseAuth } from "../config/supabase";

const prisma = new PrismaClient();

export interface AuthenticatedUser {
	id: string;
	email: string;
	role: string;
	supabaseId: string;
}

export interface AuthenticatedRequest extends Request {
	user?: AuthenticatedUser;
}

export const authenticateSupabaseToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // Bearer token

	if (!token) {
		res.status(401).json({ error: "Access token required" });
		return;
	}

	try {
		// Verify the token with Supabase using JWT verification
		const { data, error } = await supabase.auth.getUser(token);

		if (error || !data.user) {
			console.error("Supabase token verification error:", error);
			console.error("Token being verified:", token ? `${token.substring(0, 20)}...` : "null");
			res.status(401).json({ error: "Invalid or expired token" });
			return;
		}

		const user = data.user;

		// Find the user in our database using supabaseId
		const dbUser = await prisma.user.findUnique({
			where: { supabaseId: user.id },
			select: {
				id: true,
				email: true,
				role: true,
				supabaseId: true,
				name: true,
			},
		});

		if (!dbUser) {
			// User exists in Supabase but not in our database
			// This could happen for new users - we might want to create them automatically
			res.status(401).json({
				error: "User profile not found. Please complete registration.",
				supabaseUser: {
					id: user.id,
					email: user.email,
				},
			});
			return;
		}

		req.user = {
			id: dbUser.id,
			email: dbUser.email || user.email || "",
			role: dbUser.role,
			supabaseId: dbUser.supabaseId!,
		};

		next();
	} catch (error) {
		console.error("Authentication error:", error);
		res.status(403).json({ error: "Authentication failed" });
		return;
	}
};

// Helper function to create user profile after Supabase registration
export const createUserProfile = async (supabaseId: string, email: string, name?: string) => {
	try {
		const user = await prisma.user.create({
			data: {
				supabaseId,
				email,
				name: name || null,
				role: "USER",
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				supabaseId: true,
				createdAt: true,
			},
		});

		return user;
	} catch (error) {
		console.error("Error creating user profile:", error);
		throw error;
	}
};

// Role-based authorization middleware (unchanged)
export const requireRole = (role: string) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		if (req.user.role !== role && req.user.role !== "ADMIN") {
			res.status(403).json({ error: "Insufficient permissions" });
			return;
		}

		next();
	};
};

export const requireAdmin = requireRole("ADMIN");

// Legacy JWT middleware - keep for backward compatibility during migration
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	// Implementation moved from original auth.ts for backward compatibility
	const jwt = require("jsonwebtoken");
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // bearer token

	if (!token) {
		res.status(401).json({ error: "Access token required" });
		return;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

		// verify user exists in db
		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: { id: true, email: true, role: true },
		});

		if (!user || !user.email) {
			res.status(401).json({ error: "User not found" });
			return;
		}

		req.user = {
			id: user.id,
			email: user.email,
			role: user.role,
			supabaseId: "", // Empty for legacy users
		};
		next();
	} catch (error) {
		console.error("Token verification error:", error);
		res.status(403).json({ error: "Invalid or expired token" });
		return;
	}
};
