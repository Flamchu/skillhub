import type { Metadata } from "next";
import { loadMessages, resolveLocale } from "@/i18n";
import { getOpenGraphLocale } from "@/lib/i18n-utils";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale: localeParam } = await params;
	const locale = resolveLocale(localeParam);
	const messages = await loadMessages(locale);
	const metadataMessages = messages.metadata.aiSkills;

	return {
		title: metadataMessages.title,
		description: metadataMessages.description,
		openGraph: {
			locale: getOpenGraphLocale(locale),
			title: metadataMessages.openGraph.title,
			description: metadataMessages.openGraph.description,
			url: `/${locale}/ai-skills`,
		},
	};
}

export default function AISkillsLayout({ children }: { children: React.ReactNode }) {
	return children;
}
