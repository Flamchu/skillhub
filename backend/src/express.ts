import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import userSkillRoutes from "./routes/userSkills";
import regionRoutes from "./routes/regions";
import skillRoutes from "./routes/skills";
import courseRoutes from "./routes/courses";
import bookmarkRoutes from "./routes/bookmarks";
import testRoutes from "./routes/tests";
import recommendationRoutes from "./routes/recommendations";

dotenv.config();
const app = express();

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

// course routes (mixed public/protected)
app.use("/api/courses", courseRoutes);

// bookmark routes (protected) - mounted under /api/users for RESTful URLs
app.use("/api/users", bookmarkRoutes);

// test routes (mixed public/protected)
app.use("/api/tests", testRoutes);

// recommendation routes (protected)
app.use("/api/recommendations", recommendationRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
