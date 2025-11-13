import { env } from "../config/env";
import type { ProficiencyLevel } from "@prisma/client";

console.log("[AI SERVICE] Module loaded - Local AI Service enabled");

interface SkillSuggestion {
	skillName: string;
	skillSlug: string;
	suggestedProficiency: ProficiencyLevel;
	reason: string;
	priority: number;
}

interface AISkillResponse {
	skills: SkillSuggestion[];
	analysis: string;
}

// ai service config
const LOCAL_AI_SERVICE_URL = env.LOCAL_AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_ENABLED = env.AI_SERVICE_ENABLED !== "false";

export async function generateAISkillSuggestions(prompt: string, availableSkills: Array<{ name: string; slug: string; description?: string }>): Promise<AISkillResponse> {
	console.log(`[AI SERVICE] Starting skill recommendation for: "${prompt}"`);
	console.log(`[AI SERVICE] Local AI Service URL: ${LOCAL_AI_SERVICE_URL}`);
	console.log(`[AI SERVICE] AI Service Enabled: ${AI_SERVICE_ENABLED}`);

	// try local ai service first if enabled
	if (AI_SERVICE_ENABLED) {
		try {
			2;
			console.log("[AI SERVICE] Using Local AI Service with sentence-transformers for skill recommendations");
			return await generateLocalAISkillSuggestions(prompt, availableSkills);
		} catch (error) {
			console.warn("[AI SERVICE] Local AI service failed:", error);
			console.log("[AI SERVICE] Falling back to enhanced rule-based recommendations");
		}
	} else {
		console.log("[AI SERVICE] Local AI service disabled, using enhanced rule-based system");
	}

	return generateRuleBasedSuggestions(prompt, availableSkills);
}

// local ai service with sentence-transformers
async function generateLocalAISkillSuggestions(prompt: string, availableSkills: Array<{ name: string; slug: string; description?: string }>): Promise<AISkillResponse> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	// prepare skills data for ai service
	const skillsData = availableSkills.map((skill) => ({
		name: skill.name,
		slug: skill.slug,
		description: skill.description || skill.name,
	}));

	try {
		console.log("[AI SERVICE] Making request to Local AI Service...");
		console.log(`[AI SERVICE] Sending ${skillsData.length} skills for analysis`);

		// call local ai service
		const aiResponse = await fetch(`${LOCAL_AI_SERVICE_URL}/recommend-skills`, {
			method: "POST",
			headers,
			body: JSON.stringify({
				prompt: prompt,
				skills: skillsData,
				max_recommendations: 7,
			}),
		});

		console.log(`[AI SERVICE] Local AI Response status: ${aiResponse.status}`);

		if (!aiResponse.ok) {
			const errorText = await aiResponse.text();
			console.error(`[AI SERVICE] Local AI service error: ${aiResponse.status} - ${errorText}`);
			throw new Error(`Local AI service error: ${aiResponse.status} - ${errorText}`);
		}

		const aiResult: any = await aiResponse.json();
		console.log(`[AI SERVICE] Local AI Response:`, JSON.stringify(aiResult, null, 2));

		// extract skills from ai response
		if (!aiResult.skills || !Array.isArray(aiResult.skills)) {
			console.error("[AI SERVICE] Unexpected response format from Local AI service:", aiResult);
			throw new Error("Unexpected response format from Local AI service");
		}

		console.log(`[AI SERVICE] AI found ${aiResult.skills.length} skill recommendations`);

		// convert ai response to our format
		const suggestions: SkillSuggestion[] = aiResult.skills.map((aiSkill: any) => ({
			skillName: aiSkill.skillName,
			skillSlug: aiSkill.skillSlug,
			suggestedProficiency: aiSkill.suggestedProficiency as ProficiencyLevel,
			reason: aiSkill.reason,
			priority: aiSkill.priority,
		}));

		console.log(`[AI SERVICE] Successfully processed ${suggestions.length} AI recommendations`);

		// enhance with domain-specific logic
		const enhancedSuggestions = enhanceAIRecommendations(prompt, suggestions, availableSkills);

		return {
			skills: enhancedSuggestions,
			analysis: aiResult.analysis || `AI analyzed your request using semantic similarity and found ${suggestions.length} relevant skills`,
		};
	} catch (error) {
		throw new Error(`Local AI service failed: ${error}`);
	}
}

// enhance ai recommendations with domain knowledge
function enhanceAIRecommendations(prompt: string, aiSuggestions: SkillSuggestion[], availableSkills: Array<{ name: string; slug: string; description?: string }>): SkillSuggestion[] {
	const lowerPrompt = prompt.toLowerCase();
	const isBeginnerRequest = /beginner|new|start|learn|first/i.test(prompt);
	const enhanced = [...aiSuggestions];
	const addedSkills = new Set(aiSuggestions.map((s) => s.skillSlug));

	// add essential web fundamentals for beginner web dev requests
	if (isBeginnerRequest && /web|frontend|website/i.test(prompt)) {
		const webFundamentals = ["html", "css", "javascript"];
		for (const fundamental of webFundamentals) {
			if (!addedSkills.has(fundamental)) {
				const skill = availableSkills.find((s) => s.slug.toLowerCase() === fundamental);
				if (skill) {
					enhanced.unshift({
						// add to beginning for high priority
						skillName: skill.name,
						skillSlug: skill.slug,
						suggestedProficiency: "BASIC" as ProficiencyLevel,
						reason: "Essential foundation for web development",
						priority: 10,
					});
					addedSkills.add(fundamental);
				}
			}
		}
	}

	// ensure testing fundamentals are included for testing requests
	if (/test|testing|qa/i.test(prompt) && !addedSkills.has("unit-testing")) {
		const unitTesting = availableSkills.find((s) => s.slug === "unit-testing");
		if (unitTesting) {
			enhanced.push({
				skillName: unitTesting.name,
				skillSlug: unitTesting.slug,
				suggestedProficiency: "BASIC" as ProficiencyLevel,
				reason: "Fundamental skill for all testing approaches",
				priority: 8,
			});
		}
	}

	return enhanced.slice(0, 8); // limit total suggestions
}

// extract main topics from prompt
function extractMainTopics(prompt: string): string[] {
	const topics = [];
	const lowerPrompt = prompt.toLowerCase();

	if (/web|frontend|backend|html|css|javascript|react/.test(lowerPrompt)) {
		topics.push("web development");
	}
	if (/test|testing|jest|cypress|qa/.test(lowerPrompt)) {
		topics.push("testing");
	}
	if (/mobile|app|android|ios/.test(lowerPrompt)) {
		topics.push("mobile development");
	}
	if (/data|analytics|machine learning|ai/.test(lowerPrompt)) {
		topics.push("data science");
	}
	if (/devops|deployment|server|cloud/.test(lowerPrompt)) {
		topics.push("DevOps");
	}

	return topics.length > 0 ? topics : ["programming"];
}

// enhanced rule-based fallback
function generateRuleBasedSuggestions(prompt: string, availableSkills: Array<{ name: string; slug: string; description?: string }>): AISkillResponse {
	const normalizedPrompt = prompt.toLowerCase();
	const suggestions: SkillSuggestion[] = [];

	// determine experience level
	let baseProficiency: ProficiencyLevel = "BASIC";
	const beginnerKeywords = ["new", "start", "learn", "beginning", "first time", "never", "beginner", "complete beginner", "no experience", "just starting"];
	const completeBeginnerKeywords = ["complete beginner", "no experience", "never used", "starting from scratch", "absolute beginner"];

	if (completeBeginnerKeywords.some((k) => normalizedPrompt.includes(k))) {
		baseProficiency = "NONE";
	} else if (beginnerKeywords.some((k) => normalizedPrompt.includes(k))) {
		baseProficiency = "BASIC";
	} else if (normalizedPrompt.includes("experienced") || normalizedPrompt.includes("advanced") || normalizedPrompt.includes("expert")) {
		baseProficiency = "INTERMEDIATE";
	}

	// keyword categories with learning priorities
	const skillCategories: Record<
		string,
		{
			keywords: string[];
			skills: string[];
			priority: number;
			prerequisites?: string[];
		}
	> = {
		"web development foundations": {
			keywords: ["web", "website", "frontend", "html", "css"],
			skills: ["html", "css", "javascript"],
			priority: 10,
		},
		"web frameworks": {
			keywords: ["react", "vue", "angular", "framework", "frontend"],
			skills: ["react", "vue", "angular", "typescript"],
			priority: 7,
			prerequisites: ["javascript", "html", "css"],
		},
		"backend development": {
			keywords: ["backend", "server", "api", "database"],
			skills: ["nodejs", "express", "postgresql", "mongodb"],
			priority: 6,
		},
		"testing": {
			keywords: ["test", "testing", "jest", "cypress", "qa", "quality"],
			skills: ["jest", "unit-testing", "integration-testing", "test-automation"],
			priority: 5,
		},
		"programming languages": {
			keywords: ["programming", "coding", "python", "java", "typescript"],
			skills: ["javascript", "typescript", "python", "java"],
			priority: 8,
		},
		"mobile development": {
			keywords: ["mobile", "app", "android", "ios", "react native"],
			skills: ["react-native", "flutter", "swift", "kotlin"],
			priority: 4,
		},
	};

	// analyze category matches
	const matchingCategories: Array<{ category: string; matchCount: number; priority: number }> = [];

	for (const [categoryName, categoryData] of Object.entries(skillCategories)) {
		const matchCount = categoryData.keywords.filter((k) => normalizedPrompt.includes(k)).length;
		if (matchCount > 0) {
			matchingCategories.push({
				category: categoryName,
				matchCount,
				priority: categoryData.priority,
			});
		}
	}

	// sort categories by relevance
	matchingCategories.sort((a, b) => b.matchCount * b.priority - a.matchCount * a.priority);

	// generate suggestions from categories
	for (const match of matchingCategories) {
		const categoryData = skillCategories[match.category as keyof typeof skillCategories];

		for (const skillSlug of categoryData.skills) {
			const skill = availableSkills.find((s) => s.slug.toLowerCase() === skillSlug.toLowerCase());
			if (skill && !suggestions.some((s) => s.skillSlug === skill.slug)) {
				// check prerequisites for beginners
				let shouldInclude = true;
				if (baseProficiency === "NONE" && categoryData.prerequisites) {
					// for beginners, only suggest advanced skills if prerequisites are also being suggested
					const hasPrerequisites = categoryData.prerequisites.some((prereq: string) => suggestions.some((s) => s.skillSlug === prereq) || availableSkills.some((s) => s.slug === prereq && normalizedPrompt.includes(prereq)));
					shouldInclude = hasPrerequisites;
				}

				if (shouldInclude) {
					suggestions.push({
						skillName: skill.name,
						skillSlug: skill.slug,
						suggestedProficiency: baseProficiency,
						reason: `Essential for ${match.category.replace(/foundations?/, "development")}`,
						priority: categoryData.priority,
					});
				}
			}
		}
	}

	// if web development is mentioned and user is beginner, ensure fundamentals are included
	if (baseProficiency === "NONE" && normalizedPrompt.includes("web")) {
		const fundamentals = ["html", "css", "javascript"];
		for (const fundamental of fundamentals) {
			const skill = availableSkills.find((s) => s.slug.toLowerCase() === fundamental);
			if (skill && !suggestions.some((s) => s.skillSlug === skill.slug)) {
				suggestions.push({
					skillName: skill.name,
					skillSlug: skill.slug,
					suggestedProficiency: "BASIC",
					reason: "Essential foundation for web development",
					priority: 10,
				});
			}
		}
	}

	// fallback to popular beginner skills if nothing matches
	if (suggestions.length === 0) {
		const fallbackSkills = ["html", "css", "javascript", "git"];
		for (const skillSlug of fallbackSkills) {
			const skill = availableSkills.find((s) => s.slug.toLowerCase() === skillSlug);
			if (skill) {
				suggestions.push({
					skillName: skill.name,
					skillSlug: skill.slug,
					suggestedProficiency: "BASIC",
					reason: "Great foundation skill for beginners",
					priority: 8,
				});
			}
		}
	}

	// sort by priority and limit results
	const sortedSuggestions = suggestions.sort((a, b) => b.priority - a.priority).slice(0, 8);

	return {
		skills: sortedSuggestions,
		analysis: `Found ${matchingCategories.length} relevant skill categories. Recommended ${sortedSuggestions.length} skills based on your request and experience level.`,
	};
}
