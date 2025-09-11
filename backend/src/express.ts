import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./middleware/auth";
import authRoutes from "./routes/auth";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// auth routes (public)
app.use("/api/auth", authRoutes);

// example skills route (protected)
app.get("/api/skills", authenticateToken, async (_req, res) => {
	const skills = await prisma.skill.findMany();
	res.json(skills);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
