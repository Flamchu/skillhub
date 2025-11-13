import { getRequestConfig } from "next-intl/server";

// can be imported from a shared config
export const locales = ["en", "cs"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
	// this typically corresponds to the `[locale]` segment
	let locale = await requestLocale;

	// ensure that a valid locale is used
	if (!locale || !locales.includes(locale as Locale)) {
		locale = "en";
	}

	return {
		locale,
		messages: (await import(`./messages/${locale}.json`)).default,
	};
});
