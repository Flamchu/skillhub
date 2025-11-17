import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { prisma } from "../config/database";

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

		// find the user in database using supabase id, excluding soft-deleted users
		const dbUser = await prisma.user.findUnique({
			where: { supabaseId: user.id },
			select: {
				id: true,
				email: true,
				role: true,
				supabaseId: true,
				name: true,
				deletedAt: true,
			},
		});

		if (!dbUser || dbUser.deletedAt) {
			// user is deleted or doesn't exist
			if (dbUser?.deletedAt) {
				res.status(403).json({ error: "Account has been deleted" });
				return;
			}
			// user exists in supabase but not in database
			// automatically create profile for oauth users (google login)
			console.log(`Creating new user profile for Supabase user: ${user.email}`, {
				supabaseId: user.id,
				email: user.email,
				metadata: user.user_metadata,
			});

			try {
				const newUser = await createUserProfile(user.id, user.email || "", user.user_metadata?.full_name || user.user_metadata?.name || null);

				req.user = {
					id: newUser.id,
					email: newUser.email || user.email || "",
					role: newUser.role,
					supabaseId: newUser.supabaseId!,
				};

				console.log(`✅ Auto-created user profile for OAuth user: ${user.email} (DB ID: ${newUser.id})`);
				next();
				return;
			} catch (createError) {
				console.error("Failed to auto-create user profile:", createError);
				res.status(500).json({
					error: "Failed to create user profile",
					details: createError instanceof Error ? createError.message : "Unknown error",
				});
				return;
			}
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

// create user profile after supabase registration
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
				profilePicture: true,
				role: true,
				headline: true,
				bio: true,
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
