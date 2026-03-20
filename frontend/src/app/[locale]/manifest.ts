import type { MetadataRoute } from "next";
import { loadMessages, resolveLocale } from "@/i18n";

export default async function manifest({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<MetadataRoute.Manifest> {
	const { locale: localeParam } = await params;
	const locale = resolveLocale(localeParam);
	const messages = await loadMessages(locale);
	const manifestMessages = messages.metadata.manifest;

	return {
		name: manifestMessages.name,
		short_name: "SkillHub",
		description: manifestMessages.description,
		start_url: `/${locale}`,
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#7c3aed",
		icons: [
			{
				src: "/favicon.ico",
				sizes: "any",
				type: "image/x-icon",
			},
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
		categories: manifestMessages.categories,
		lang: locale,
	};
}
