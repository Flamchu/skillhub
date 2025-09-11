import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// rate limiting for auth endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // limit each IP to 5 requests per windowMs
	message: { error: "Too many authentication attempts, please try again later." },
	standardHeaders: true,
	legacyHeaders: false,
});

// validation helpers
const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

const validatePassword = (password: string): string | null => {
	if (password.length < 8) {
		return "Password must be at least 8 characters long";
	}
	if (!/(?=.*[a-z])/.test(password)) {
		return "Password must contain at least one lowercase letter";
	}
	if (!/(?=.*[A-Z])/.test(password)) {
		return "Password must contain at least one uppercase letter";
	}
	if (!/(?=.*\d)/.test(password)) {
		return "Password must contain at least one number";
	}
	if (!/(?=.*[@$!%*?&])/.test(password)) {
		return "Password must contain at least one special character (@$!%*?&)";
	}
	return null;
};

// generate jwt token
const generateToken = (userId: string): string => {
	if (!process.env.JWT_SECRET) {
		throw new Error("JWT_SECRET environment variable is required");
	}

	return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// register endpoint
router.post("/register", authLimiter, async (req, res: Response) => {
	try {
		const { email, password, name } = req.body;

		// validation
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		if (!validateEmail(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		const passwordError = validatePassword(password);
		if (passwordError) {
			return res.status(400).json({ error: passwordError });
		}

		// check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: email.toLowerCase() },
		});

		if (existingUser) {
			return res.status(409).json({ error: "User with this email already exists" });
		}

		// hash password
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// create user
		const user = await prisma.user.create({
			data: {
				email: email.toLowerCase(),
				password: hashedPassword,
				name: name || null,
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true,
			},
		});

		// generate token
		const token = generateToken(user.id);

		res.status(201).json({
			message: "User registered successfully",
			user,
			token,
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// login endpoint
router.post("/login", authLimiter, async (req, res: Response) => {
	try {
		const { email, password } = req.body;

		// validation
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		// find user
		const user = await prisma.user.findUnique({
			where: { email: email.toLowerCase() },
		});

		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// verify password
		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// generate token
		const token = generateToken(user.id);

		res.json({
			message: "Login successful",
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				createdAt: user.createdAt,
			},
			token,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get current user profile (protected route)
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user!.id },
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
				region: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json({ user });
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// change password (protected route)
router.patch("/change-password", authLimiter, authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({ error: "Current password and new password are required" });
		}

		const passwordError = validatePassword(newPassword);
		if (passwordError) {
			return res.status(400).json({ error: passwordError });
		}

		// get user with password
		const user = await prisma.user.findUnique({
			where: { id: req.user!.id },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// verify current password
		const isValidPassword = await bcrypt.compare(currentPassword, user.password);
		if (!isValidPassword) {
			return res.status(401).json({ error: "Current password is incorrect" });
		}

		// hash new password
		const saltRounds = 12;
		const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

		// update password
		await prisma.user.update({
			where: { id: req.user!.id },
			data: { password: hashedNewPassword },
		});

		res.json({ message: "Password changed successfully" });
	} catch (error) {
		console.error("Change password error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
