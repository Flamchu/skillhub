import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth";
import { supabase } from "../config/supabase";

const router = Router();
const prisma = new PrismaClient();

/**
 * Migration endpoint for existing JWT users to migrate to Supabase Auth
 * This allows seamless transition without losing user data
 */
router.post("/migrate-to-supabase", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const user = req.user!;

		if (!currentPassword) {
			return res.status(400).json({
				error: "Current password is required for migration",
			});
		}

		// Get full user record including password
		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		if (!dbUser || !dbUser.password) {
			return res.status(404).json({ error: "User not found or already migrated" });
		}

		// Verify current password
		const isValidPassword = await bcrypt.compare(currentPassword, dbUser.password);
		if (!isValidPassword) {
			return res.status(401).json({ error: "Current password is incorrect" });
		}

		// Check if user already has a Supabase account
		if (dbUser.supabaseId) {
			return res.status(400).json({
				error: "User already migrated to Supabase Auth",
			});
		}

		const passwordToUse = newPassword || currentPassword;

		try {
			// Create user in Supabase Auth
			const { data: supabaseUser, error: createError } = await supabase.auth.admin.createUser({
				email: dbUser.email,
				password: passwordToUse,
				email_confirm: true, // Auto-confirm since they're already verified in our system
				user_metadata: {
					name: dbUser.name,
					migrated_from_jwt: true,
					migration_date: new Date().toISOString(),
				},
			});

			if (createError) {
				console.error("Supabase user creation error:", createError);
				if (createError.message.includes("already registered")) {
					return res.status(409).json({
						error: "A Supabase account with this email already exists",
					});
				}
				return res.status(400).json({ error: createError.message });
			}

			if (!supabaseUser.user) {
				return res.status(500).json({ error: "Failed to create Supabase account" });
			}

			// Update our database record with Supabase ID and remove password
			const updatedUser = await prisma.user.update({
				where: { id: user.id },
				data: {
					supabaseId: supabaseUser.user.id,
					password: null, // Remove the hashed password
				},
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					supabaseId: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			res.json({
				message: "Successfully migrated to Supabase Auth",
				user: updatedUser,
				migrationInfo: {
					supabaseId: supabaseUser.user.id,
					migratedAt: new Date().toISOString(),
				},
			});
		} catch (supabaseError: any) {
			console.error("Supabase migration error:", supabaseError);
			res.status(500).json({
				error: "Failed to create Supabase account",
				details: supabaseError.message,
			});
		}
	} catch (error) {
		console.error("Migration error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

/**
 * Check migration status for current user
 */
router.get("/migration-status", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const user = req.user!;

		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				supabaseId: true,
				password: true,
				email: true,
				createdAt: true,
			},
		});

		if (!dbUser) {
			return res.status(404).json({ error: "User not found" });
		}

		const status = {
			isMigrated: !!dbUser.supabaseId,
			hasPassword: !!dbUser.password,
			canMigrate: !!dbUser.password && !dbUser.supabaseId,
			email: dbUser.email,
			userId: dbUser.id,
		};

		res.json({ status });
	} catch (error) {
		console.error("Migration status error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

/**
 * Batch migration endpoint for admins to migrate multiple users
 */
router.post("/batch-migrate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const user = req.user!;

		// Only admins can perform batch migrations
		if (user.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { userIds, defaultPassword } = req.body;

		if (!Array.isArray(userIds) || userIds.length === 0) {
			return res.status(400).json({ error: "userIds array is required" });
		}

		if (!defaultPassword) {
			return res.status(400).json({ error: "defaultPassword is required for batch migration" });
		}

		const results = {
			successful: [] as string[],
			failed: [] as { userId: string; error: string }[],
		};

		// Process users one by one to avoid overwhelming Supabase
		for (const userId of userIds) {
			try {
				const dbUser = await prisma.user.findUnique({
					where: { id: userId },
				});

				if (!dbUser || dbUser.supabaseId) {
					results.failed.push({
						userId,
						error: "User not found or already migrated",
					});
					continue;
				}

				// Create Supabase user
				const { data: supabaseUser, error: createError } = await supabase.auth.admin.createUser({
					email: dbUser.email,
					password: defaultPassword,
					email_confirm: true,
					user_metadata: {
						name: dbUser.name,
						migrated_by_admin: true,
						migration_date: new Date().toISOString(),
					},
				});

				if (createError || !supabaseUser.user) {
					results.failed.push({
						userId,
						error: createError?.message || "Failed to create Supabase user",
					});
					continue;
				}

				// Update database
				await prisma.user.update({
					where: { id: userId },
					data: {
						supabaseId: supabaseUser.user.id,
						password: null,
					},
				});

				results.successful.push(userId);
			} catch (error: any) {
				results.failed.push({
					userId,
					error: error.message || "Unknown error",
				});
			}
		}

		res.json({
			message: "Batch migration completed",
			results,
			summary: {
				total: userIds.length,
				successful: results.successful.length,
				failed: results.failed.length,
			},
		});
	} catch (error) {
		console.error("Batch migration error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
