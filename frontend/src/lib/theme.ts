export const THEME_STORAGE_KEY = "theme";

export const themes = ["light", "dark", "system"] as const;
export type Theme = (typeof themes)[number];

export function getDefaultTheme(): Theme {
	const env = process.env.NEXT_PUBLIC_DEFAULT_THEME as Theme | undefined;
	if (env && themes.includes(env)) return env;
	return "system";
}
