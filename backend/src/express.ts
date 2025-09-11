import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import userSkillRoutes from "./routes/userSkills";
import regionRoutes from "./routes/regions";
import skillRoutes from "./routes/skills";

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

// user routes (mixed public/protected)
app.use("/api/users", userRoutes);

// user skills routes (protected)
app.use("/api/users", userSkillRoutes);

// region routes (mixed public/protected)
app.use("/api/regions", regionRoutes);

// skills routes (mixed public/protected)
app.use("/api/skills", skillRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
