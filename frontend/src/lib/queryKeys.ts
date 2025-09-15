export const qk = {
	skill: (id: string) => ["skill", id] as const,
	skills: (filters?: Record<string, unknown>) => ["skills", filters ?? {}] as const,
	courses: (filters?: Record<string, unknown>) => ["courses", filters ?? {}] as const,
	course: (id: string) => ["course", id] as const,
	user: (id: string) => ["user", id] as const,
	userSkills: (id: string) => ["user", id, "skills"] as const,
	bookmarks: (id: string) => ["user", id, "bookmarks"] as const,
	recommendations: (id: string) => ["recommendations", id] as const,
	test: (id: string) => ["test", id] as const,
	tests: (filters?: Record<string, unknown>) => ["tests", filters ?? {}] as const,
	attempt: (id: string) => ["attempt", id] as const,
};
