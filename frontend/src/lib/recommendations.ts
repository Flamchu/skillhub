import { http } from "./http";
import type { RecommendationsResponse, AISkillsResponse, Recommendation } from "@/types";

// get user recommendations
export async function getRecommendations(params?: {
	userId?: string;
	skillId?: string;
	algorithm?: string;
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}): Promise<RecommendationsResponse> {
	const { data } = await http.get("/recommendations", { params });
	return data;
}

// generate new recommendations for user
export async function generateRecommendations(params?: {
	userId?: string;
	algorithm?: "RULES" | "CONTENT_BASED" | "COLLAB_FILTER" | "HYBRID" | "SEMANTIC";
	maxRecommendations?: number;
}): Promise<{
	message: string;
	recommendations: Recommendation[];
	algorithm: string;
	count: number;
}> {
	const { data } = await http.post("/recommendations/generate", params);
	return data;
}

// generate AI skill suggestions
export async function generateAISkills(params: { prompt: string; userId?: string }): Promise<AISkillsResponse> {
	const { data } = await http.post("/recommendations/ai-skills", params);
	return data;
}

// get top N recommended courses for display strip
export async function getTopRecommendedCourses(limit = 5): Promise<Recommendation[]> {
	const response = await getRecommendations({ limit, sortBy: "score", sortOrder: "desc" });
	return response.recommendations.filter(r => r.course).slice(0, limit);
}
