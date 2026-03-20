import type { Metadata } from "next";
import { loadMessages, resolveLocale } from "@/i18n";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale: localeParam } = await params;
	const locale = resolveLocale(localeParam);
	const messages = await loadMessages(locale);
	const metadataMessages = messages.metadata.dashboard;

	return {
		title: metadataMessages.title,
		description: metadataMessages.description,
		robots: {
			index: false,
			follow: false,
		},
	};
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return children;
}
