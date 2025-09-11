"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const userSkills_1 = __importDefault(require("./routes/userSkills"));
const regions_1 = __importDefault(require("./routes/regions"));
const skills_1 = __importDefault(require("./routes/skills"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
// auth routes (public)
app.use("/api/auth", auth_1.default);
// user routes (mixed public/protected)
app.use("/api/users", users_1.default);
// user skills routes (protected)
app.use("/api/users", userSkills_1.default);
// region routes (mixed public/protected)
app.use("/api/regions", regions_1.default);
// skills routes (mixed public/protected)
app.use("/api/skills", skills_1.default);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
