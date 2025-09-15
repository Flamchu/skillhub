// lightweight analytics abstraction
import { Analytics } from "@vercel/analytics/react";

export function track(event: string, props?: Record<string, unknown>) {
	// placeholder: extend with real provider later
	if (process.env.NODE_ENV === "development") {
		console.debug("[analytics]", event, props || {});
	}
	// add real dispatch here
}

export const AnalyticsComponent = Analytics; // re-export for layout usage
