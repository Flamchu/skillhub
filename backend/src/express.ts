import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import supabaseAuthRoutes from "./routes/supabaseAuth";
import userRoutes from "./routes/users";
import userSkillRoutes from "./routes/userSkills";
import regionRoutes from "./routes/regions";
import skillRoutes from "./routes/skills";
import courseRoutes from "./routes/courses";
import bookmarkRoutes from "./routes/bookmarks";
import testRoutes from "./routes/tests";
import recommendationRoutes from "./routes/recommendations";
import { performanceMonitoring, performanceEndpoint, healthCheck } from "./middleware/performance";
import { connectDatabase } from "./config/database";
import "./config/redis"; // Initialize Redis connection

dotenv.config();
const app = express();

// Performance monitoring
app.use(performanceMonitoring);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health and monitoring endpoints
app.get("/api/health", healthCheck);
app.get("/api/performance", performanceEndpoint);

// auth routes (public)
app.use("/api/auth", supabaseAuthRoutes); // Supabase auth (now primary)

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

// Error handling middleware (must be last)
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Initialize database connection
connectDatabase()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
			console.log(`📊 Performance monitoring: http://localhost:${PORT}/api/performance`);
			console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
		});
	})
	.catch((error) => {
		console.error("Failed to start server:", error);
		process.exit(1);
	});
