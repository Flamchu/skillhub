import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./supabaseAuth";
import { prisma } from "../config/database";

/**
 * middleware to check if user has social features enabled
 * must be used after authenticateSupabaseToken
 */
export async function requireSocialEnabled(req: AuthenticatedRequest, res: Response, next: NextFunction) {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ error: "Authentication required" });
		}

		// check if user has social enabled
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { socialEnabled: true },
		});

		if (!user || !user.socialEnabled) {
			return res.status(403).json({
				error: "Social features are not enabled",
				message: "Enable social features in your profile settings to access this feature",
			});
		}

		next();
	} catch (error) {
		console.error("Social enabled check error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
