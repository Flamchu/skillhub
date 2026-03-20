import { getRequestConfig } from "next-intl/server";

// can be imported from a shared config
export const locales = ["en", "cs"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(locale: string): locale is Locale {
	return locales.includes(locale as Locale);
}

export function resolveLocale(locale?: string | null): Locale {
	if (locale && isLocale(locale)) {
		return locale;
	}

	return "en";
}

export async function loadMessages(locale: string) {
	const resolvedLocale = resolveLocale(locale);
	return (await import(`./messages/${resolvedLocale}.json`)).default;
}

export default getRequestConfig(async ({ requestLocale }) => {
	const locale = resolveLocale(await requestLocale);

	return {
		locale,
		messages: await loadMessages(locale),
	};
});
