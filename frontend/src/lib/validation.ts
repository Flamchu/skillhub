import { z } from "zod";

// placeholder shared schemas
export const skillIdParam = z.string().uuid("Invalid skill id");

export const updateUserProfileSchema = z.object({
	name: z.string().min(2).max(100).optional(),
	headline: z.string().max(160).optional(),
	bio: z.string().max(2000).optional(),
	regionId: z.uuid().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
