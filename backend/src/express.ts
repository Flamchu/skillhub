import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Example skills route
app.get("/api/skills", async (_req, res) => {
	const skills = await prisma.skill.findMany();
	res.json(skills);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
