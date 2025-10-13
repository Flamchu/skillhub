import { z } from "zod";
import { Role, ProficiencyLevel, CourseSource, CourseDifficulty, RecommendationAlgorithm } from "@prisma/client";

// common schemas
export const uuidSchema = z.uuid({ message: "Invalid UUID format" });
export const emailSchema = z.email({ message: "Invalid email format" });
export const passwordSchema = z
	.string()
	.min(8, { message: "Password must be at least 8 characters" })
	.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
		message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
	});

export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	sortBy: z.string().optional(),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// auth schemas
export const registerSchema = z.object({
	body: z.object({
		email: emailSchema,
		password: passwordSchema,
		name: z.string().min(1, { message: "Name is required" }).max(100),
	}),
});

export const loginSchema = z.object({
	body: z.object({
		email: emailSchema,
		password: z.string().min(1, { message: "Password is required" }),
	}),
});

export const refreshTokenSchema = z.object({
	body: z.object({
		refresh_token: z.string().min(1, { message: "Refresh token is required" }),
	}),
});

export const changePasswordSchema = z.object({
	body: z.object({
		currentPassword: z.string().min(1, { message: "Current password is required" }),
		newPassword: passwordSchema,
	}),
});

// oauth schemas
export const oauthCallbackSchema = z.object({
	query: z.object({
		code: z.string().min(1, { message: "Authorization code is required" }),
		state: z.string().min(1, { message: "State parameter is required" }),
	}),
});

export const oauthInitiateSchema = z.object({
	body: z.object({
		provider: z.enum(["google"], { message: "Provider must be 'google'" }),
		redirectUrl: z.string().url({ message: "Valid redirect URL is required" }).optional(),
	}),
});

// user schemas
export const getUserSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
});

export const updateUserSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
	body: z.object({
		name: z.string().min(1).max(100).optional(),
		headline: z.string().max(200).optional(),
		bio: z.string().max(1000).optional(),
		regionId: uuidSchema.optional(),
	}),
});

export const getUsersSchema = z.object({
	query: paginationSchema.extend({
		search: z.string().optional(),
		role: z.enum(Role).optional(),
		regionId: uuidSchema.optional(),
	}),
});

// user skills schemas
export const userSkillsSchema = z.object({
	params: z.object({
		userId: uuidSchema,
	}),
	query: z.object({
		includeProgress: z.enum(["true", "false"]).default("false"),
	}),
});

export const addUserSkillSchema = z.object({
	params: z.object({
		userId: uuidSchema,
	}),
	body: z.object({
		skillId: uuidSchema,
		proficiency: z.enum(ProficiencyLevel).optional(),
		targetLevel: z.enum(ProficiencyLevel).optional(),
	}),
});

export const updateUserSkillSchema = z.object({
	params: z.object({
		userId: uuidSchema,
		skillId: uuidSchema,
	}),
	body: z.object({
		proficiency: z.enum(ProficiencyLevel).optional(),
		targetLevel: z.enum(ProficiencyLevel).optional(),
		progress: z.number().int().min(0).max(100).optional(),
	}),
});

export const deleteUserSkillSchema = z.object({
	params: z.object({
		userId: uuidSchema,
		skillId: uuidSchema,
	}),
});

export const userSkillProgressionSchema = z.object({
	params: z.object({
		userId: uuidSchema,
		skillId: uuidSchema,
	}),
});

// skills schemas
export const getSkillsSchema = z.object({
	query: z.object({
		parentId: uuidSchema.optional(),
		search: z.string().optional(),
		includeChildren: z.enum(["true", "false"]).default("false"),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	}),
});

export const getSkillSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
	query: z.object({
		includeStats: z.enum(["true", "false"]).default("false"),
	}),
});

export const createSkillSchema = z.object({
	body: z.object({
		name: z.string().min(1).max(100),
		slug: z
			.string()
			.min(1)
			.max(100)
			.regex(/^[a-z0-9-]+$/, {
				message: "Slug must contain only lowercase letters, numbers, and hyphens",
			}),
		description: z.string().max(500).optional(),
		parentId: uuidSchema.optional(),
	}),
});

export const updateSkillSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
	body: z.object({
		name: z.string().min(1).max(100).optional(),
		slug: z
			.string()
			.min(1)
			.max(100)
			.regex(/^[a-z0-9-]+$/)
			.optional(),
		description: z.string().max(500).optional(),
		parentId: uuidSchema.optional(),
	}),
});

export const advancedSkillSearchSchema = z.object({
	query: z
		.object({
			name: z.string().optional(),
			parentIds: z.string().optional(), // comma-separated UUIDs
			excludeParentIds: z.string().optional(), // comma-separated UUIDs
			hasChildren: z.enum(["true", "false"]).optional(),
			minUserCount: z.coerce.number().int().min(0).optional(),
			maxDepth: z.coerce.number().int().min(0).optional(),
		})
		.extend(paginationSchema.shape),
});

// courses schemas
export const getCoursesSchema = z.object({
	query: z
		.object({
			skillId: uuidSchema.optional(),
			tag: z.string().optional(),
			difficulty: z.enum(CourseDifficulty).optional(),
			freeOnly: z.enum(["true", "false"]).default("false"),
			provider: z.string().optional(),
			source: z.enum(CourseSource).optional(),
			language: z.string().default("en"),
			minRating: z.coerce.number().min(0).max(5).optional(),
			maxDuration: z.coerce.number().int().min(0).optional(),
			search: z.string().optional(),
		})
		.extend(paginationSchema.shape),
});

export const getCourseSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
});

export const createCourseSchema = z.object({
	body: z.object({
		title: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
		aiSummary: z.string().max(500).optional(), // ai-generated summary
		url: z.url(),
		provider: z.string().min(1).max(100),
		source: z.enum(CourseSource),
		externalId: z.string().optional(),
		difficulty: z.enum(CourseDifficulty),
		durationMinutes: z.number().int().min(0).optional(),
		rating: z.number().min(0).max(5).optional(),
		ratingCount: z.number().int().min(0).optional(),
		isPaid: z.boolean().default(false),
		priceCents: z.number().int().min(0).optional(),
		currency: z.string().length(3).default("USD"), // ISO currency code
		language: z.string().default("en"),
		tags: z.array(z.string().min(1).max(50)).optional(),
		skills: z
			.array(
				z.object({
					skillId: uuidSchema,
					relevance: z.number().int().min(0).max(100).default(100),
				})
			)
			.optional(),
	}),
});

export const updateCourseSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
	body: z.object({
		title: z.string().min(1).max(200).optional(),
		description: z.string().max(2000).optional(),
		aiSummary: z.string().max(500).optional(), // ai-generated summary
		url: z.url().optional(),
		provider: z.string().min(1).max(100).optional(),
		difficulty: z.enum(CourseDifficulty).optional(),
		durationMinutes: z.number().int().min(0).optional(),
		rating: z.number().min(0).max(5).optional(),
		ratingCount: z.number().int().min(0).optional(),
		isPaid: z.boolean().optional(),
		priceCents: z.number().int().min(0).optional(),
		currency: z.string().length(3).optional(),
		language: z.string().optional(),
		tags: z.array(z.string().min(1).max(50)).optional(),
		skills: z
			.array(
				z.object({
					skillId: uuidSchema,
					relevance: z.number().int().min(0).max(100).default(100),
				})
			)
			.optional(),
	}),
});

// youtube ingestion schemas
export const youtubeIngestSchema = z.object({
	body: z.object({
		url: z
			.string()
			.url({ message: "Valid YouTube URL is required" })
			.refine(
				(url) => {
					const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/;
					return youtubeRegex.test(url);
				},
				{ message: "URL must be a valid YouTube URL" }
			),
		skillIds: z.array(uuidSchema).optional(),
		tags: z.array(z.string().min(1).max(50)).max(10).optional(),
		difficulty: z.enum(CourseDifficulty).optional(),
		overrides: z
			.object({
				title: z.string().min(1).max(200).optional(),
				description: z.string().max(2000).optional(),
			})
			.optional(),
	}),
});

export const updateUserProgressSchema = z.object({
	params: z.object({
		lessonId: uuidSchema,
	}),
	body: z.object({
		completed: z.boolean().optional(),
		progressPercent: z.number().int().min(0).max(100).optional(),
		watchTimeSeconds: z.number().int().min(0).optional(),
	}),
});

export const getCourseProgressSchema = z.object({
	params: z.object({
		courseId: uuidSchema,
	}),
});

export const enrollCourseSchema = z.object({
	params: z.object({
		courseId: uuidSchema,
	}),
});

export const getUserEnrollmentsSchema = z.object({
	query: paginationSchema,
});

// bookmarks schemas
export const getUserBookmarksSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
	query: paginationSchema,
});

export const createBookmarkSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
	body: z.object({
		courseId: uuidSchema,
	}),
});

export const deleteBookmarkSchema = z.object({
	params: z.object({
		id: uuidSchema,
		courseId: uuidSchema,
	}),
});

// tests schemas
export const getTestsSchema = z.object({
	query: z
		.object({
			skillId: uuidSchema.optional(),
			difficulty: z.enum(CourseDifficulty).optional(),
			isPublished: z.enum(["true", "false"]).default("true"),
		})
		.extend(paginationSchema.shape),
});

export const getTestSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
});

export const createTestAttemptSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
});

export const submitTestAttemptSchema = z.object({
	params: z.object({
		attemptId: uuidSchema,
	}),
	body: z.object({
		answers: z.record(z.string(), z.any()), // questionId -> answer
	}),
});

export const getUserTestAttemptsSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
	query: paginationSchema,
});

// recommendations schemas
export const getRecommendationsSchema = z.object({
	query: z
		.object({
			algorithm: z.enum(RecommendationAlgorithm).optional(),
			type: z.enum(["course", "skill", "test"]).optional(),
		})
		.extend(paginationSchema.shape),
});

export const generateRecommendationsSchema = z.object({
	body: z.object({
		algorithm: z.enum(RecommendationAlgorithm).optional(),
		maxResults: z.number().int().min(1).max(50).default(10),
		includeBookmarked: z.boolean().default(false),
	}),
});

// regions schemas
export const getRegionsSchema = z.object({
	query: paginationSchema,
});

export const getRegionSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
});

export const getRegionCompetitionSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
	query: z.object({
		skillId: uuidSchema,
	}),
});

export const getRegionRankingSchema = z.object({
	params: z.object({
		id: uuidSchema,
		userId: uuidSchema,
	}),
	query: z.object({
		skillId: uuidSchema,
	}),
});

export const createRegionSchema = z.object({
	body: z.object({
		name: z.string().min(1).max(100),
		code: z.string().min(2).max(10),
		description: z.string().max(500).optional(),
	}),
});

export const updateRegionSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
	body: z.object({
		name: z.string().min(1).max(100).optional(),
		code: z.string().min(2).max(10).optional(),
		description: z.string().max(500).optional(),
	}),
});

export const deleteRegionSchema = z.object({
	params: z.object({
		id: uuidSchema,
	}),
});

// export all schemas for easy import
export const schemas = {
	// Auth
	register: registerSchema,
	login: loginSchema,
	refreshToken: refreshTokenSchema,
	changePassword: changePasswordSchema,

	// OAuth
	oauthCallback: oauthCallbackSchema,
	oauthInitiate: oauthInitiateSchema,

	// Users
	getUser: getUserSchema,
	updateUser: updateUserSchema,
	getUsers: getUsersSchema,

	// User Skills
	getUserSkills: userSkillsSchema,
	addUserSkill: addUserSkillSchema,
	updateUserSkill: updateUserSkillSchema,
	deleteUserSkill: deleteUserSkillSchema,
	getUserSkillProgression: userSkillProgressionSchema,

	// Skills
	getSkills: getSkillsSchema,
	getSkill: getSkillSchema,
	createSkill: createSkillSchema,
	updateSkill: updateSkillSchema,
	advancedSkillSearch: advancedSkillSearchSchema,

	// Courses
	getCourses: getCoursesSchema,
	getCourse: getCourseSchema,
	createCourse: createCourseSchema,
	updateCourse: updateCourseSchema,

	// YouTube Ingestion
	youtubeIngest: youtubeIngestSchema,
	updateUserProgress: updateUserProgressSchema,
	getCourseProgress: getCourseProgressSchema,

	// Enrollments
	enrollCourse: enrollCourseSchema,
	getUserEnrollments: getUserEnrollmentsSchema,

	// Bookmarks
	getUserBookmarks: getUserBookmarksSchema,
	createBookmark: createBookmarkSchema,
	deleteBookmark: deleteBookmarkSchema,

	// Tests
	getTests: getTestsSchema,
	getTest: getTestSchema,
	createTestAttempt: createTestAttemptSchema,
	submitTestAttempt: submitTestAttemptSchema,
	getUserTestAttempts: getUserTestAttemptsSchema,

	// Recommendations
	getRecommendations: getRecommendationsSchema,
	generateRecommendations: generateRecommendationsSchema,

	// Regions
	getRegions: getRegionsSchema,
	getRegion: getRegionSchema,
	getRegionCompetition: getRegionCompetitionSchema,
	getRegionRanking: getRegionRankingSchema,
	createRegion: createRegionSchema,
	updateRegion: updateRegionSchema,
	deleteRegion: deleteRegionSchema,
};
