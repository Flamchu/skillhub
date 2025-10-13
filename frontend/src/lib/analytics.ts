// lightweight analytics abstraction
import { Analytics } from "@vercel/analytics/react";

interface AnalyticsEvent {
	event: string;
	properties?: Record<string, unknown>;
	userId?: string;
	timestamp?: Date;
}

class AnalyticsService {
	private queue: AnalyticsEvent[] = [];
	private isEnabled: boolean;

	constructor() {
		this.isEnabled = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
	}

	track(event: string, properties?: Record<string, unknown>) {
		const analyticsEvent: AnalyticsEvent = {
			event,
			properties: {
				...properties,
				url: typeof window !== "undefined" ? window.location.href : undefined,
				userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
			},
			timestamp: new Date(),
		};

		if (process.env.NODE_ENV === "development") {
			console.warn("[analytics]", analyticsEvent);
		}

		if (this.isEnabled) {
			this.queue.push(analyticsEvent);
			this.flush();
		}
	}

	// user events
	trackUserLogin(userId: string, method: "email" | "oauth" = "email") {
		this.track("user_login", { userId, method });
	}

	trackUserRegister(userId: string) {
		this.track("user_register", { userId });
	}

	trackUserLogout(userId: string) {
		this.track("user_logout", { userId });
	}

	// skill events
	trackSkillView(skillId: string, skillName: string) {
		this.track("skill_view", { skillId, skillName });
	}

	trackSkillAdd(skillId: string, skillName: string, proficiencyLevel: string) {
		this.track("skill_add", { skillId, skillName, proficiencyLevel });
	}

	trackSkillUpdate(skillId: string, oldLevel: string, newLevel: string) {
		this.track("skill_update", { skillId, oldLevel, newLevel });
	}

	// course events
	trackCourseView(courseId: string, courseName: string) {
		this.track("course_view", { courseId, courseName });
	}

	trackCourseBookmark(courseId: string, courseName: string, action: "add" | "remove") {
		this.track("course_bookmark", { courseId, courseName, action });
	}

	// test events
	trackTestStart(testId: string, testName: string) {
		this.track("test_start", { testId, testName });
	}

	trackTestComplete(testId: string, testName: string, score: number, duration: number) {
		this.track("test_complete", { testId, testName, score, duration });
	}

	// search events
	trackSearch(query: string, type?: string, resultCount?: number) {
		this.track("search", { query, type, resultCount });
	}

	// recommendation events
	trackRecommendationGenerate(userId: string, algorithm: string) {
		this.track("recommendation_generate", { userId, algorithm });
	}

	trackRecommendationClick(recommendationId: string, position: number) {
		this.track("recommendation_click", { recommendationId, position });
	}

	private async flush() {
		if (this.queue.length === 0) return;

		try {
			// send to backend analytics endpoint (when implemented)
			if (process.env.NEXT_PUBLIC_BACKEND_URL) {
				await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/events`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ events: this.queue }),
				}).catch(() => {
					// silently fail - analytics shouldn't break the app
				});
			}
		} finally {
			this.queue = [];
		}
	}
}

// singleton instance
export const analytics = new AnalyticsService();

// convenience function for backward compatibility
export function track(event: string, properties?: Record<string, unknown>) {
	analytics.track(event, properties);
}

export const AnalyticsComponent = Analytics; // re-export for layout usage
