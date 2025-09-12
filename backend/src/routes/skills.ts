import { Router, Request, Response } from "express";
import { AuthenticatedRequest, authenticateSupabaseToken } from "../middleware/supabaseAuth";
import { cache, cacheConfigs, invalidateCacheMiddleware } from "../middleware/cache";
import { CACHE_KEYS } from "../config/redis";
import { prisma } from "../config/database";

const router = Router();

// get all skills with optional filtering and hierarchy
router.get("/", cache(cacheConfigs.skillsList), async (req: Request, res: Response) => {
	try {
		const { includeChildren = "false", parentId, search, sortBy = "name", sortOrder = "asc" } = req.query;

		// build where clause
		const where: any = {};

		if (parentId) {
			where.parentId = parentId === "null" ? null : (parentId as string);
		}

		if (search) {
			where.OR = [{ name: { contains: search as string, mode: "insensitive" } }, { description: { contains: search as string, mode: "insensitive" } }, { slug: { contains: search as string, mode: "insensitive" } }];
		}

		// build order by
		const orderBy: any = {};
		orderBy[sortBy as string] = sortOrder;

		const skills = await prisma.skill.findMany({
			where,
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				children:
					includeChildren === "true"
						? {
								select: {
									id: true,
									name: true,
									slug: true,
									description: true,
								},
						  }
						: false,
				_count: {
					select: {
						UserSkill: true,
						courses: true,
						tests: true,
					},
				},
			},
			orderBy,
		});

		res.json({ skills });
	} catch (error) {
		console.error("Get skills error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get skill by id with full details
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { includeStats = "false" } = req.query;

		const skill = await prisma.skill.findUnique({
			where: { id },
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
						description: true,
					},
				},
				children: {
					select: {
						id: true,
						name: true,
						slug: true,
						description: true,
					},
				},
				_count: {
					select: {
						UserSkill: true,
						courses: true,
						tests: true,
					},
				},
			},
		});

		if (!skill) {
			return res.status(404).json({ error: "Skill not found" });
		}

		let enrichedSkill = skill;

		// include additional statistics if requested
		if (includeStats === "true") {
			const [userSkillStats, topUsers, recentCourses] = await Promise.all([
				// user skill proficiency distribution
				prisma.userSkill.groupBy({
					by: ["proficiency"],
					where: { skillId: id },
					_count: {
						id: true,
					},
				}),

				// top users with this skill
				prisma.userSkill.findMany({
					where: { skillId: id },
					include: {
						user: {
							select: {
								id: true,
								name: true,
							},
						},
					},
					orderBy: [{ proficiency: "desc" }, { progress: "desc" }],
					take: 5,
				}),

				// recent courses for this skill
				prisma.course.findMany({
					where: {
						skills: {
							some: {
								skillId: id,
							},
						},
					},
					select: {
						id: true,
						title: true,
						provider: true,
						difficulty: true,
						rating: true,
					},
					orderBy: {
						createdAt: "desc",
					},
					take: 5,
				}),
			]);

			const proficiencyDistribution = userSkillStats.reduce(
				(acc, group) => {
					const proficiencyKey = group.proficiency.toLowerCase() as keyof typeof acc;
					acc[proficiencyKey] = group._count.id;
					return acc;
				},
				{
					none: 0,
					basic: 0,
					intermediate: 0,
					advanced: 0,
					expert: 0,
				}
			);

			enrichedSkill = {
				...skill,
				stats: {
					proficiencyDistribution,
					topUsers,
					recentCourses,
				},
			} as any;
		}

		res.json({ skill: enrichedSkill });
	} catch (error) {
		console.error("Get skill error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// get skills hierarchy (root skills with nested children)
router.get("/hierarchy/tree", cache(cacheConfigs.skillsHierarchy), async (_req, res: Response) => {
	try {
		const rootSkills = await prisma.skill.findMany({
			where: {
				parentId: null,
			},
			include: {
				children: {
					include: {
						children: {
							include: {
								children: true, // up to 4 levels deep
							},
						},
					},
				},
				_count: {
					select: {
						UserSkill: true,
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		});

		res.json({ skillsTree: rootSkills });
	} catch (error) {
		console.error("Get skills hierarchy error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// search skills with advanced filtering
router.get("/search/advanced", async (req: Request, res: Response) => {
	try {
		const {
			q, // search query
			minUsers = "0",
			maxUsers,
			hasCourses = "false",
			hasTests = "false",
			level, // hierarchy level (0 = root, 1 = first level, etc.)
			limit = "20",
			offset = "0",
		} = req.query;

		const where: any = {};

		// text search
		if (q) {
			where.OR = [{ name: { contains: q as string, mode: "insensitive" } }, { description: { contains: q as string, mode: "insensitive" } }, { slug: { contains: q as string, mode: "insensitive" } }];
		}

		// hierarchy level filter
		if (level !== undefined) {
			const levelNum = parseInt(level as string);
			if (levelNum === 0) {
				where.parentId = null;
			} else {
				// this would require more complex querying to get exact level
				// for now, just filter non-root skills
				where.parentId = { not: null };
			}
		}

		const skills = await prisma.skill.findMany({
			where,
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				_count: {
					select: {
						UserSkill: true,
						courses: true,
						tests: true,
					},
				},
			},
			orderBy: {
				name: "asc",
			},
			take: parseInt(limit as string),
			skip: parseInt(offset as string),
		});

		// apply post-processing filters
		let filteredSkills = skills;

		const minUsersNum = parseInt(minUsers as string);
		const maxUsersNum = maxUsers ? parseInt(maxUsers as string) : undefined;

		filteredSkills = filteredSkills.filter((skill) => {
			const userCount = skill._count.UserSkill;

			if (userCount < minUsersNum) return false;
			if (maxUsersNum && userCount > maxUsersNum) return false;

			if (hasCourses === "true" && skill._count.courses === 0) return false;
			if (hasTests === "true" && skill._count.tests === 0) return false;

			return true;
		});

		const totalCount = await prisma.skill.count({ where });

		res.json({
			skills: filteredSkills,
			pagination: {
				total: totalCount,
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				hasMore: parseInt(offset as string) + filteredSkills.length < totalCount,
			},
		});
	} catch (error) {
		console.error("Advanced skill search error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// create skill (admin only)
router.post("/", authenticateSupabaseToken, invalidateCacheMiddleware([`${CACHE_KEYS.SKILLS_HIERARCHY}:*`, `${CACHE_KEYS.SKILLS_LIST}:*`]), async (req: AuthenticatedRequest, res: Response) => {
	try {
		const currentUser = req.user!;

		if (currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { name, slug, description, parentId } = req.body;

		if (!name || !slug) {
			return res.status(400).json({ error: "Name and slug are required" });
		}

		if (typeof name !== "string" || name.trim().length < 1) {
			return res.status(400).json({ error: "Name must be a non-empty string" });
		}

		if (typeof slug !== "string" || slug.trim().length < 1) {
			return res.status(400).json({ error: "Slug must be a non-empty string" });
		}

		// validate slug format (alphanumeric and hyphens only)
		if (!/^[a-z0-9-]+$/.test(slug)) {
			return res.status(400).json({ error: "Slug must contain only lowercase letters, numbers, and hyphens" });
		}

		// validate parent skill exists if provided
		if (parentId) {
			const parentSkill = await prisma.skill.findUnique({
				where: { id: parentId },
			});

			if (!parentSkill) {
				return res.status(400).json({ error: "Parent skill not found" });
			}
		}

		const skill = await prisma.skill.create({
			data: {
				name: name.trim(),
				slug: slug.trim().toLowerCase(),
				description: description?.trim(),
				parentId: parentId || null,
			},
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		});

		res.status(201).json({
			message: "Skill created successfully",
			skill,
		});
	} catch (error) {
		console.error("Create skill error:", error);
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			res.status(400).json({ error: "Skill with this name or slug already exists" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

// update skill (admin only)
router.patch("/:id", authenticateSupabaseToken, invalidateCacheMiddleware([`${CACHE_KEYS.SKILLS_HIERARCHY}:*`, `${CACHE_KEYS.SKILLS_LIST}:*`]), async (req: AuthenticatedRequest, res: Response) => {
	try {
		const currentUser = req.user!;

		if (currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { id } = req.params;
		const { name, slug, description, parentId } = req.body;

		// check if skill exists
		const existingSkill = await prisma.skill.findUnique({
			where: { id },
		});

		if (!existingSkill) {
			return res.status(404).json({ error: "Skill not found" });
		}

		const updateData: any = {};

		if (name !== undefined) {
			if (typeof name !== "string" || name.trim().length < 1) {
				return res.status(400).json({ error: "Name must be a non-empty string" });
			}
			updateData.name = name.trim();
		}

		if (slug !== undefined) {
			if (typeof slug !== "string" || slug.trim().length < 1) {
				return res.status(400).json({ error: "Slug must be a non-empty string" });
			}
			if (!/^[a-z0-9-]+$/.test(slug)) {
				return res.status(400).json({ error: "Slug must contain only lowercase letters, numbers, and hyphens" });
			}
			updateData.slug = slug.trim().toLowerCase();
		}

		if (description !== undefined) {
			updateData.description = description?.trim();
		}

		if (parentId !== undefined) {
			// prevent circular references
			if (parentId === id) {
				return res.status(400).json({ error: "A skill cannot be its own parent" });
			}

			if (parentId) {
				const parentSkill = await prisma.skill.findUnique({
					where: { id: parentId },
				});

				if (!parentSkill) {
					return res.status(400).json({ error: "Parent skill not found" });
				}

				// check if the new parent would create a circular reference
				// by checking if the current skill is an ancestor of the proposed parent
				const checkCircularReference = async (checkId: string, targetId: string): Promise<boolean> => {
					const skill = await prisma.skill.findUnique({
						where: { id: checkId },
						select: { parentId: true },
					});

					if (!skill?.parentId) return false;
					if (skill.parentId === targetId) return true;
					return checkCircularReference(skill.parentId, targetId);
				};

				const wouldCreateCircle = await checkCircularReference(parentId, id);
				if (wouldCreateCircle) {
					return res.status(400).json({ error: "This would create a circular reference in the skill hierarchy" });
				}
			}

			updateData.parentId = parentId;
		}

		const updatedSkill = await prisma.skill.update({
			where: { id },
			data: updateData,
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				children: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		});

		res.json({
			message: "Skill updated successfully",
			skill: updatedSkill,
		});
	} catch (error) {
		console.error("Update skill error:", error);
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			res.status(400).json({ error: "Skill with this name or slug already exists" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

// delete skill (admin only)
router.delete("/:id", authenticateSupabaseToken, async (req: AuthenticatedRequest, res: Response) => {
	try {
		const currentUser = req.user!;

		if (currentUser.role !== "ADMIN") {
			return res.status(403).json({ error: "Admin access required" });
		}

		const { id } = req.params;

		// check if skill exists
		const skill = await prisma.skill.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						children: true,
						UserSkill: true,
						courses: true,
						tests: true,
					},
				},
			},
		});

		if (!skill) {
			return res.status(404).json({ error: "Skill not found" });
		}

		// check for dependencies
		const dependencies = [];
		if (skill._count.children > 0) dependencies.push(`${skill._count.children} child skills`);
		if (skill._count.UserSkill > 0) dependencies.push(`${skill._count.UserSkill} user associations`);
		if (skill._count.courses > 0) dependencies.push(`${skill._count.courses} course associations`);
		if (skill._count.tests > 0) dependencies.push(`${skill._count.tests} tests`);

		if (dependencies.length > 0) {
			return res.status(400).json({
				error: `Cannot delete skill with dependencies: ${dependencies.join(", ")}`,
			});
		}

		await prisma.skill.delete({
			where: { id },
		});

		res.json({ message: "Skill deleted successfully" });
	} catch (error) {
		console.error("Delete skill error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
