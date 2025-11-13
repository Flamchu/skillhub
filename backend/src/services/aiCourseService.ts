import { env } from "../config/env";

// ai service config
const LOCAL_AI_SERVICE_URL = env.LOCAL_AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_ENABLED = env.AI_SERVICE_ENABLED !== "false";

interface UserSkill {
	name: string;
	proficiency: string;
	progress: number;
}

interface CourseForRecommendation {
	id: string;
	title: string;
	description?: string;
	skills: Array<{ name: string }>;
}

interface CourseRecommendation {
	course_id: string;
	title: string;
	relevance_score: number;
	matching_skills: string[];
	reason: string;
	priority: number;
}

interface AICourseResponse {
	courses: CourseRecommendation[];
	analysis: string;
}

export async function generateAICourseRecommendations(userSkills: UserSkill[], availableCourses: CourseForRecommendation[], maxRecommendations = 10): Promise<AICourseResponse> {
	if (!AI_SERVICE_ENABLED) {
		return {
			courses: [],
			analysis: "ai service is currently disabled",
		};
	}

	try {
		const response = await fetch(`${LOCAL_AI_SERVICE_URL}/recommend-courses`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_skills: userSkills,
				available_courses: availableCourses,
				max_recommendations: maxRecommendations,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[AI COURSE] ai service error: ${response.status} - ${errorText}`);
			throw new Error(`ai service error: ${response.status}`);
		}

		const data = (await response.json()) as AICourseResponse;

		return data;
	} catch (error) {
		console.error("[AI COURSE] failed to get ai recommendations:", error);

		// return empty result on error
		return {
			courses: [],
			analysis: "failed to generate ai recommendations",
		};
	}
}
