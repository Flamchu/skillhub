// unified storage key used by next-themes provider and manual scripts
export const THEME_STORAGE_KEY = "skillhub-theme";

export const themes = ["light", "dark", "system"] as const;
export type Theme = (typeof themes)[number];

export function getDefaultTheme(): Theme {
	const env = process.env.NEXT_PUBLIC_DEFAULT_THEME as Theme | undefined;
	if (env && themes.includes(env)) return env;
	return "system";
}

export function getStoredTheme(): Theme | null {
	if (typeof window === "undefined") return null;
	const v = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
	return v && (themes as readonly string[]).includes(v) ? v : null;
}

export function persistTheme(t: Theme) {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, t);
	} catch {
		/* ignore */
	}
}
