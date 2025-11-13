export interface UserProfile {
	id: string;
	supabaseId: string;
	email?: string;
	name?: string;
	headline?: string;
	bio?: string;
	role: "USER" | "INSTRUCTOR" | "ADMIN";
	regionId?: string;
}

export interface Skill {
	id: string;
	name: string;
	slug: string;
	description?: string;
	parentId?: string;
}

export interface Lesson {
	id: string;
	title: string;
	description?: string;
	position: number;
	providerVideoId: string;
	url: string;
	durationSeconds: number;
	thumbnail?: string;
	createdAt: string;
}

export interface Course {
	id: string;
	title: string;
	description?: string;
	aiSummary?: string; // ai-generated summary
	provider?: string;
	source: "INTERNAL" | "YOUTUBE" | "UDEMY" | "OTHER";
	difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
	isPaid: boolean;
	rating?: number;
	durationMinutes?: number;
	priceCents?: number;
	language?: string;
	url?: string;
	externalId?: string;
	thumbnail?: string;
	createdAt: string;
	updatedAt: string;
	lessons?: Lesson[];
	skills?: {
		skill: {
			id: string;
			name: string;
			slug: string;
		};
		relevance: number;
	}[];
	_count?: {
		lessons?: number;
		Bookmark: number;
		Recommendation: number;
		enrollments: number;
	};
}

export interface CoursesResponse {
	courses: Course[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export interface CourseFilters {
	skillId?: string;
	tag?: string;
	difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
	freeOnly?: boolean;
	provider?: string;
	source?: "INTERNAL" | "YOUTUBE" | "UDEMY" | "OTHER";
	language?: string;
	minRating?: number;
	maxDuration?: number;
	search?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface Recommendation {
	id: string;
	userId: string;
	skillId?: string;
	courseId?: string;
	algorithm: "RULES" | "CONTENT_BASED" | "COLLAB_FILTER" | "HYBRID";
	score: number;
	meta?: {
		reasons?: string[];
		algorithm?: string;
	};
	createdAt: string;
	skill?: Skill;
	course?: Course;
}

export interface RecommendationsResponse {
	recommendations: Recommendation[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export interface AISkillSuggestion {
	skill: Skill;
	suggestedProficiency: "NONE" | "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
	reason: string;
}

export interface AISkillsResponse {
	message: string;
	skills: AISkillSuggestion[];
	prompt: string;
}

export interface Recommendation {
	id: string;
	algorithm: "RULES" | "CONTENT_BASED" | "COLLAB_FILTER" | "HYBRID";
	score: number;
}

// admin types
export interface CreateCourseData {
	title: string;
	description?: string;
	provider?: string;
	source?: "INTERNAL" | "YOUTUBE" | "UDEMY" | "OTHER";
	externalId?: string;
	url?: string;
	language?: string;
	difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
	durationMinutes?: number;
	rating?: number;
	isPaid?: boolean;
	priceCents?: number;
	skills?: Array<{ skillId: string; relevance?: number }>;
}

export type UpdateCourseData = Partial<CreateCourseData>;

export interface CreateSkillData {
	name: string;
	slug: string;
	description?: string;
	parentId?: string;
}

export type UpdateSkillData = Partial<CreateSkillData>;

export interface UpdateUserData {
	name?: string;
	headline?: string;
	bio?: string;
	regionId?: string;
	role?: "USER" | "INSTRUCTOR" | "ADMIN";
}

// YouTube import types
export interface YouTubeImportData {
	url: string;
	skillIds?: string[];
	difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
	overrides?: {
		title?: string;
		description?: string;
	};
}

export interface YouTubeImportResponse {
	course: Course;
	lessonsCount: number;
	message: string;
}

export interface UsersResponse {
	users: UserProfile[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export interface DashboardStats {
	totals: {
		users: number;
		courses: number;
		skills: number;
		tests: number;
	};
	growth: {
		usersThisWeek: number;
		usersThisMonth: number;
		coursesThisWeek: number;
		skillsThisWeek: number;
	};
	recentActivity: Array<{
		type: "user" | "course" | "skill";
		message: string;
		time: string;
		id: string;
	}>;
}

export interface DashboardStatsResponse {
	stats: DashboardStats;
}

export interface Enrollment {
	id: string;
	userId: string;
	courseId: string;
	enrolledAt: string;
	completedAt?: string;
	isCompleted: boolean;
	createdAt: string;
	updatedAt: string;
	course: Course;
}

export interface EnrollmentsResponse {
	enrollments: Enrollment[];
	pagination: {
		page: number;
		limit: number;
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export interface UserActivity {
	id: string;
	type: "enrollment" | "progress" | "completion";
	title: string;
	description: string;
	courseId?: string;
	courseTitle?: string;
	lessonId?: string;
	lessonTitle?: string;
	provider?: string;
	progressPercent?: number;
	completed?: boolean;
	timestamp: string;
	timeAgo: string;
	icon: "BookOpen" | "Play" | "CheckCircle" | "Award";
}

export interface UserActivityResponse {
	userId: string;
	activity: UserActivity[];
	totalCount: number;
}

// skill verification types
export type ProficiencyLevel = "NONE" | "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface SkillVerificationChoice {
	id: string;
	label: string;
	choiceText: string;
	order: number;
	isCorrect?: boolean; // only included in admin views
}

export interface SkillVerificationQuestion {
	id: string;
	questionText: string;
	difficultyLevel: ProficiencyLevel;
	points: number;
	order: number;
	choices: SkillVerificationChoice[];
}

export interface SkillVerificationQuestionsResponse {
	skill: {
		id: string;
		name: string;
		slug: string;
	};
	questions: SkillVerificationQuestion[];
	totalPoints: number;
	questionsCount: number;
}

export interface SkillVerificationAttempt {
	id: string;
	userId: string;
	skillId: string;
	startedAt: string;
	completedAt?: string;
	totalPoints: number;
	earnedPoints: number;
	achievedLevel?: ProficiencyLevel;
	passedVerification: boolean;
	createdAt: string;
	updatedAt: string;
	skill: {
		id: string;
		name: string;
		slug: string;
	};
	scorePercentage?: number;
}

export interface SkillVerificationResults {
	totalPoints: number;
	earnedPoints: number;
	scorePercentage: number;
	achievedLevel: ProficiencyLevel;
	passedVerification: boolean;
	answersCount: number;
	correctAnswersCount: number;
}

export interface SkillVerificationAttemptResponse {
	attempt: SkillVerificationAttempt;
	results?: SkillVerificationResults;
}

export interface SkillVerificationAnswer {
	questionId: string;
	selectedChoices: string[]; // array of choice IDs
}

export interface SkillVerificationSubmitRequest {
	answers: SkillVerificationAnswer[];
}

export interface SkillVerificationSubmitResponse {
	attempt: SkillVerificationAttempt;
	results: SkillVerificationResults;
}

export interface UserSkill {
	id: string;
	userId: string;
	skillId: string;
	proficiency: ProficiencyLevel;
	targetLevel?: ProficiencyLevel;
	progress: number;
	lastPracticed?: string;
	isVerified: boolean;
	verificationAttemptId?: string;
	createdAt: string;
	updatedAt: string;
	skill: {
		id: string;
		name: string;
		slug: string;
		description?: string;
	};
}

export interface AddSkillRequest {
	skillId: string;
	proficiency?: ProficiencyLevel;
	targetLevel?: ProficiencyLevel;
	progress?: number;
	skipVerification?: boolean;
}

export interface AddSkillResponse {
	message: string;
	userSkill?: UserSkill;
	requiresVerification?: boolean;
	skillId?: string;
	requestedProficiency?: ProficiencyLevel;
}

// admin verification types
export interface CreateVerificationQuestionRequest {
	questionText: string;
	difficultyLevel?: ProficiencyLevel;
	points?: number;
	order?: number;
	choices: Array<{
		choiceText: string;
		isCorrect: boolean;
	}>;
}

export interface BulkCreateVerificationQuestionsRequest {
	questions: CreateVerificationQuestionRequest[];
}
