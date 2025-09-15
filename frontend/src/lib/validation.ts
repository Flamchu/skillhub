import { z } from "zod";

// shared validation schemas matching backend
export const skillIdParam = z.string().uuid("invalid skill id");
export const userIdParam = z.string().uuid("invalid user id");
export const courseIdParam = z.string().uuid("invalid course id");
export const testIdParam = z.string().uuid("invalid test id");

// auth schemas
export const loginSchema = z.object({
	email: z.string().email("invalid email address"),
	password: z.string().min(6, "password must be at least 6 characters"),
});

export const registerSchema = z.object({
	name: z.string().min(2, "name must be at least 2 characters").max(100, "name too long"),
	email: z.string().email("invalid email address"),
	password: z.string().min(6, "password must be at least 6 characters"),
});

// user profile schemas
export const updateUserProfileSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	headline: z.string().max(160).optional(),
	bio: z.string().max(2000).optional(),
	regionId: z.uuid().optional(),
});

// user skill schemas
export const addUserSkillSchema = z.object({
	skillId: z.string().uuid("invalid skill id"),
	proficiencyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
	yearsOfExperience: z.number().min(0).max(50).optional(),
	notes: z.string().max(500).optional(),
});

export const updateUserSkillSchema = z.object({
	proficiencyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
	yearsOfExperience: z.number().min(0).max(50).optional(),
	notes: z.string().max(500).optional(),
});

// course filtering schemas
export const courseFilterSchema = z.object({
	search: z.string().optional(),
	skillIds: z.array(z.string().uuid()).optional(),
	source: z.enum(["INTERNAL", "EXTERNAL"]).optional(),
	minRating: z.number().min(0).max(5).optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});

// test attempt schemas
export const submitTestAnswersSchema = z.object({
	answers: z
		.array(
			z.object({
				questionId: z.string().uuid(),
				selectedOption: z.string().min(1),
			})
		)
		.min(1, "At least one answer is required"),
});

// pagination schema
export const paginationSchema = z.object({
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});

// search schema
export const searchSchema = z.object({
	q: z.string().min(1, "Search query is required"),
	type: z.enum(["skills", "courses", "users"]).optional(),
});

// export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type AddUserSkillInput = z.infer<typeof addUserSkillSchema>;
export type UpdateUserSkillInput = z.infer<typeof updateUserSkillSchema>;
export type CourseFilterInput = z.infer<typeof courseFilterSchema>;
export type SubmitTestAnswersInput = z.infer<typeof submitTestAnswersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
