import { Router, Response } from "express";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, authenticateSupabaseToken, createUserProfile } from "../middleware/supabaseAuth";
import { supabase, supabaseAuth } from "../config/supabase";

const router = Router();
const prisma = new PrismaClient();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 2000, // Reduced from 5000 for better security
	message: { error: "Too many authentication attempts, please try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

// Validation helpers
const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

// Register endpoint - creates Supabase user and profile
router.post("/register", authLimiter, async (req, res: Response) => {
	try {
		const { email, password, name } = req.body;

		// Validation
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		if (!validateEmail(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Create user in Supabase Auth
		const { data, error } = await supabase.auth.admin.createUser({
			email: email.toLowerCase(),
			password,
			email_confirm: true, // Auto-confirm email for now
		});

		if (error) {
			console.error("Supabase registration error:", error);
			if (error.message.includes("already registered")) {
				return res.status(409).json({ error: "User with this email already exists" });
			}
			return res.status(400).json({ error: error.message });
		}

		if (!data.user) {
			return res.status(500).json({ error: "Failed to create user account" });
		}

		// Create user profile in our database
		try {
			const userProfile = await createUserProfile(data.user.id, email.toLowerCase(), name);

			res.status(201).json({
				message: "User registered successfully",
				user: userProfile,
			});
		} catch (dbError: any) {
			// If profile creation fails, clean up Supabase user
			await supabase.auth.admin.deleteUser(data.user.id);
			console.error("Profile creation error:", dbError);

			if (dbError.code === "P2002" && dbError.meta?.target?.includes("email")) {
				return res.status(409).json({ error: "User with this email already exists" });
			}

			return res.status(500).json({ error: "Failed to create user profile" });
		}
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Login endpoint - uses Supabase Auth
router.post("/login", authLimiter, async (req, res: Response) => {
	try {
		const { email, password } = req.body;

		// Validation
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		// Sign in with Supabase
		const { data, error } = await supabaseAuth.auth.signInWithPassword({
			email: email.toLowerCase(),
			password,
		});

		if (error) {
			console.error("Supabase login error:", error);
			return res.status(401).json({ error: "Invalid credentials" });
		}

		if (!data.user || !data.session) {
			return res.status(401).json({ error: "Login failed" });
		}

		// Get user profile from our database
		const userProfile = await prisma.user.findUnique({
			where: { supabaseId: data.user.id },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				headline: true,
				bio: true,
				createdAt: true,
			},
		});

		if (!userProfile) {
			return res.status(404).json({
				error: "User profile not found",
				supabaseUser: {
					id: data.user.id,
					email: data.user.email,
				},
			});
		}

		res.json({
			message: "Login successful",
			user: userProfile,
			session: {
				access_token: data.session.access_token,
				refresh_token: data.session.refresh_token,
				expires_at: data.session.expires_at,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Refresh token endpoint
router.post("/refresh", authLimiter, async (req, res: Response) => {
	try {
		const { refresh_token } = req.body;

		if (!refresh_token) {
			return res.status(400).json({ error: "Refresh token is required" });
		}

		const { data, error } = await supabaseAuth.auth.refreshSession({
			refresh_token,
		});

		if (error) {
			console.error("Token refresh error:", error);
			return res.status(401).json({ error: "Invalid refresh token" });
		}

		if (!data.session) {
			return res.status(401).json({ error: "Token refresh failed" });
		}

		res.json({
			message: "Token refreshed successfully",
			session: {
				access_token: data.session.access_token,
				refresh_token: data.session.refresh_token,
				expires_at: data.session.expires_at,
			},
		});
	} catch (error) {
		console.error("Refresh error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Logout endpoint
router.post("/logout", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];

		if (token) {
			// Sign out from Supabase (this invalidates the token)
			await supabaseAuth.auth.signOut();
		}

		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Logout error:", error);
		// Still return success even if logout fails
		res.json({ message: "Logged out successfully" });
	}
});

// Change password endpoint
router.patch("/change-password", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const user = req.user!;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				error: "Current password and new password are required",
			});
		}

		// Verify current password by attempting to sign in
		const { error: verifyError } = await supabaseAuth.auth.signInWithPassword({
			email: user.email,
			password: currentPassword,
		});

		if (verifyError) {
			return res.status(401).json({ error: "Current password is incorrect" });
		}

		// Update password in Supabase
		const { error: updateError } = await supabase.auth.admin.updateUserById(user.supabaseId, { password: newPassword });

		if (updateError) {
			console.error("Password update error:", updateError);
			return res.status(400).json({ error: updateError.message });
		}

		// After password change, we should create a new session for the user
		// This ensures their current session remains valid
		const { data: newSessionData, error: sessionError } = await supabaseAuth.auth.signInWithPassword({
			email: user.email,
			password: newPassword,
		});

		if (sessionError || !newSessionData.session) {
			console.error("Session creation error after password change:", sessionError);
			// Password was changed but session creation failed - still success
			return res.json({
				message: "Password updated successfully. Please log in again with your new password.",
				requireReauth: true,
			});
		}

		// Return new session tokens so user doesn't need to re-authenticate
		res.json({
			message: "Password updated successfully",
			session: {
				access_token: newSessionData.session.access_token,
				refresh_token: newSessionData.session.refresh_token,
				expires_at: newSessionData.session.expires_at,
			},
		});
	} catch (error) {
		console.error("Change password error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Complete profile endpoint (for users who exist in Supabase but not in our DB)
router.post("/complete-profile", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { name, headline, bio } = req.body;

		// This endpoint should only be accessible if user doesn't have a profile yet
		// The middleware will handle this case and provide supabase user info
		res.status(400).json({ error: "Profile already exists" });
	} catch (error) {
		console.error("Complete profile error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get current user endpoint
router.get("/me", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const user = req.user!;

		const userProfile = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				name: true,
				headline: true,
				bio: true,
				role: true,
				regionId: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!userProfile) {
			return res.status(404).json({ error: "User profile not found" });
		}

		res.json({ user: userProfile });
	} catch (error) {
		console.error("Get user error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
