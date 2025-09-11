"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// get all regions (public)
router.get("/", async (_req, res) => {
    try {
        const regions = await prisma.region.findMany({
            select: {
                id: true,
                name: true,
                code: true,
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
        res.json({ regions });
    }
    catch (error) {
        console.error("Get regions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// get region by id with details (public)
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const region = await prisma.region.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                    },
                },
                skillStats: {
                    include: {
                        skill: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                    orderBy: {
                        avgProficiency: "desc",
                    },
                },
            },
        });
        if (!region) {
            return res.status(404).json({ error: "Region not found" });
        }
        res.json({ region });
    }
    catch (error) {
        console.error("Get region error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// get competition stats for a region and skill
router.get("/:id/competition", async (req, res) => {
    try {
        const { id } = req.params;
        const { skillId } = req.query;
        if (!skillId) {
            return res.status(400).json({ error: "Skill ID is required" });
        }
        // check if region exists
        const region = await prisma.region.findUnique({
            where: { id },
        });
        if (!region) {
            return res.status(404).json({ error: "Region not found" });
        }
        // check if skill exists
        const skill = await prisma.skill.findUnique({
            where: { id: skillId },
        });
        if (!skill) {
            return res.status(400).json({ error: "Skill not found" });
        }
        // get skill statistics for the region
        const skillStats = await prisma.skillMarketStat.findUnique({
            where: {
                skillId_regionId: {
                    skillId: skillId,
                    regionId: id,
                },
            },
        });
        // get user rankings for this skill in the region
        const userRankings = await prisma.userSkill.findMany({
            where: {
                skillId: skillId,
                user: {
                    regionId: id,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [{ proficiency: "desc" }, { progress: "desc" }, { updatedAt: "desc" }],
            take: 50, // top 50 users
        });
        // calculate percentile distributions
        const proficiencyDistribution = userRankings.reduce((acc, userSkill) => {
            acc[userSkill.proficiency] = (acc[userSkill.proficiency] || 0) + 1;
            return acc;
        }, {});
        // calculate average progress by proficiency level
        const progressByLevel = userRankings.reduce((acc, userSkill) => {
            if (!acc[userSkill.proficiency]) {
                acc[userSkill.proficiency] = { total: 0, count: 0 };
            }
            acc[userSkill.proficiency].total += userSkill.progress;
            acc[userSkill.proficiency].count += 1;
            return acc;
        }, {});
        const averageProgressByLevel = Object.entries(progressByLevel).reduce((acc, [level, data]) => {
            const levelData = data;
            acc[level] = Math.round(levelData.total / levelData.count);
            return acc;
        }, {});
        res.json({
            region: {
                id: region.id,
                name: region.name,
                code: region.code,
            },
            skill: {
                id: skill.id,
                name: skill.name,
                slug: skill.slug,
            },
            competition: {
                totalUsers: userRankings.length,
                marketStats: skillStats,
                proficiencyDistribution,
                averageProgressByLevel,
                topUsers: userRankings.slice(0, 10).map((userSkill, index) => ({
                    rank: index + 1,
                    user: userSkill.user,
                    proficiency: userSkill.proficiency,
                    progress: userSkill.progress,
                    lastPracticed: userSkill.lastPracticed,
                })),
            },
        });
    }
    catch (error) {
        console.error("Get competition stats error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// get user's ranking in region for a skill (protected)
router.get("/:id/ranking/:userId", auth_1.authenticateToken, async (req, res) => {
    try {
        const { id: regionId, userId } = req.params;
        const { skillId } = req.query;
        const currentUser = req.user;
        // users can only check their own ranking unless they're admin
        if (currentUser.id !== userId && currentUser.role !== "ADMIN") {
            return res.status(403).json({ error: "Access denied" });
        }
        if (!skillId) {
            return res.status(400).json({ error: "Skill ID is required" });
        }
        // check if user exists and is in the specified region
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.regionId !== regionId) {
            return res.status(400).json({ error: "User is not in the specified region" });
        }
        // get user's skill
        const userSkill = await prisma.userSkill.findUnique({
            where: {
                userId_skillId: {
                    userId,
                    skillId: skillId,
                },
            },
        });
        if (!userSkill) {
            return res.status(404).json({ error: "User does not have this skill" });
        }
        // get users with better ranking (this is a simplified ranking system)
        const betterUsers = await prisma.userSkill.count({
            where: {
                skillId: skillId,
                user: {
                    regionId,
                },
                OR: [
                    {
                        progress: {
                            gt: userSkill.progress,
                        },
                    },
                ],
            },
        });
        // get total users with this skill in the region
        const totalUsers = await prisma.userSkill.count({
            where: {
                skillId: skillId,
                user: {
                    regionId,
                },
            },
        });
        const rank = betterUsers + 1;
        const percentile = totalUsers > 1 ? Math.round(((totalUsers - rank) / (totalUsers - 1)) * 100) : 100;
        res.json({
            ranking: {
                rank,
                totalUsers,
                percentile,
                userSkill: {
                    proficiency: userSkill.proficiency,
                    progress: userSkill.progress,
                    lastPracticed: userSkill.lastPracticed,
                },
            },
        });
    }
    catch (error) {
        console.error("Get user ranking error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// create region (admin only)
router.post("/", auth_1.authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        if (currentUser.role !== "ADMIN") {
            return res.status(403).json({ error: "Admin access required" });
        }
        const { name, code } = req.body;
        if (!name || !code) {
            return res.status(400).json({ error: "Name and code are required" });
        }
        if (typeof name !== "string" || name.trim().length < 1) {
            return res.status(400).json({ error: "Name must be a non-empty string" });
        }
        if (typeof code !== "string" || code.trim().length < 2) {
            return res.status(400).json({ error: "Code must be at least 2 characters long" });
        }
        const region = await prisma.region.create({
            data: {
                name: name.trim(),
                code: code.trim().toUpperCase(),
            },
        });
        res.status(201).json({
            message: "Region created successfully",
            region,
        });
    }
    catch (error) {
        console.error("Create region error:", error);
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            res.status(400).json({ error: "Region with this name or code already exists" });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
// update region (admin only)
router.patch("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        if (currentUser.role !== "ADMIN") {
            return res.status(403).json({ error: "Admin access required" });
        }
        const { id } = req.params;
        const { name, code } = req.body;
        const updateData = {};
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length < 1) {
                return res.status(400).json({ error: "Name must be a non-empty string" });
            }
            updateData.name = name.trim();
        }
        if (code !== undefined) {
            if (typeof code !== "string" || code.trim().length < 2) {
                return res.status(400).json({ error: "Code must be at least 2 characters long" });
            }
            updateData.code = code.trim().toUpperCase();
        }
        const updatedRegion = await prisma.region.update({
            where: { id },
            data: updateData,
        });
        res.json({
            message: "Region updated successfully",
            region: updatedRegion,
        });
    }
    catch (error) {
        console.error("Update region error:", error);
        if (error instanceof Error && error.message.includes("Record to update not found")) {
            res.status(404).json({ error: "Region not found" });
        }
        else if (error instanceof Error && error.message.includes("Unique constraint")) {
            res.status(400).json({ error: "Region with this name or code already exists" });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
// delete region (admin only)
router.delete("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        if (currentUser.role !== "ADMIN") {
            return res.status(403).json({ error: "Admin access required" });
        }
        const { id } = req.params;
        // check if region has users
        const usersCount = await prisma.user.count({
            where: { regionId: id },
        });
        if (usersCount > 0) {
            return res.status(400).json({
                error: `Cannot delete region with ${usersCount} users. Please reassign users first.`,
            });
        }
        await prisma.region.delete({
            where: { id },
        });
        res.json({ message: "Region deleted successfully" });
    }
    catch (error) {
        console.error("Delete region error:", error);
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            res.status(404).json({ error: "Region not found" });
        }
        else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});
exports.default = router;
