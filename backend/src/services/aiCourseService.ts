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
	console.log(`[AI COURSE] generating recommendations for ${userSkills.length} user skills`);
	console.log(`[AI COURSE] analyzing ${availableCourses.length} available courses`);

	if (!AI_SERVICE_ENABLED) {
		console.log("[AI COURSE] ai service disabled, returning empty recommendations");
		return {
			courses: [],
			analysis: "ai service is currently disabled",
		};
	}

	try {
		console.log("[AI COURSE] calling local ai service for course recommendations");

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

		console.log(`[AI COURSE] ai service response status: ${response.status}`);

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[AI COURSE] ai service error: ${response.status} - ${errorText}`);
			throw new Error(`ai service error: ${response.status}`);
		}

		const data = (await response.json()) as AICourseResponse;

		console.log(`[AI COURSE] received ${data.courses.length} course recommendations`);

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
