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
	const token = authHeader && authHeader.split(" ")[1]; // bearer token

	if (!token) {
		res.status(401).json({ error: "Access token required" });
		return;
	}

	try {
		// verify the token with supabase using jwt verification
		const { data, error } = await supabase.auth.getUser(token);

		if (error || !data.user) {
			console.error("Supabase token verification error:", error);
			console.error("Token being verified:", token ? `${token.substring(0, 20)}...` : "null");
			res.status(401).json({ error: "Invalid or expired token" });
			return;
		}

		const user = data.user;

		// find the user in database using supabase id
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
			// user exists in supabase but not in database
			// could happen for new users - might want to create them automatically
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

// helper function to create user profile after supabase registration
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

// role-based authorization middleware
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
