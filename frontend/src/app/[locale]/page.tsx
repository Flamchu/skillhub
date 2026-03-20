import { Navigation, HeroSection, FeaturesSection, StatsSection, Footer } from "@/components/landing";
import Link from "next/link";
import type { Metadata } from "next";
import { loadMessages, resolveLocale } from "@/i18n";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale: localeParam } = await params;
	const locale = resolveLocale(localeParam);
	const messages = await loadMessages(locale);
	const metadataMessages = messages.metadata.home;

	return {
		title: metadataMessages.title,
		description: metadataMessages.description,
		openGraph: {
			title: metadataMessages.openGraph.title,
			description: metadataMessages.openGraph.description,
			url: `/${locale}`,
			images: [
				{
					url: "/og-image.png",
					width: 1200,
					height: 630,
					alt: metadataMessages.openGraph.imageAlt,
				},
			],
		},
	};
}

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale: localeParam } = await params;
	const locale = resolveLocale(localeParam);
	const t = await getTranslations({ locale, namespace: "home.aiSection" });

	return (
		<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
			<Navigation />
			<HeroSection />
			<FeaturesSection />

			{/* AI Recommendations Section */}
			<section className="px-6 py-20">
				<div className="max-w-6xl mx-auto">
					<div className="bg-linear-to-r from-primary/10 via-purple/10 to-pink/10 rounded-3xl p-12 border border-primary/20">
						<div className="text-center mb-12">
							<div className="inline-flex items-center px-6 py-3 bg-linear-to-r from-primary/20 to-purple/20 text-primary rounded-full text-sm font-semibold mb-6 border border-primary/30">
								🤖 {t("badge")}
							</div>
							<h3 className="text-4xl md:text-5xl font-bold mb-6">
								<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
									{t("title")}
								</span>
							</h3>
							<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
								{t("description")}
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8 mb-12">
							<div className="text-center">
								<div className="w-20 h-20 bg-linear-to-br from-primary to-purple rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
									<span className="text-3xl">🎯</span>
								</div>
								<h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{t("cards.matching.title")}</h4>
								<p className="text-gray-600 dark:text-gray-300">{t("cards.matching.description")}</p>
							</div>

							<div className="text-center">
								<div className="w-20 h-20 bg-linear-to-br from-success to-info rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
									<span className="text-3xl">🚀</span>
								</div>
								<h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{t("cards.progression.title")}</h4>
								<p className="text-gray-600 dark:text-gray-300">{t("cards.progression.description")}</p>
							</div>

							<div className="text-center">
								<div className="w-20 h-20 bg-linear-to-br from-warning to-pink rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
									<span className="text-3xl">✨</span>
								</div>
								<h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{t("cards.generator.title")}</h4>
								<p className="text-gray-600 dark:text-gray-300">{t("cards.generator.description")}</p>
							</div>
						</div>

						<div className="text-center">
							<Link
								href="/courses/recommended"
								className="inline-flex items-center px-8 py-4 bg-linear-to-r from-primary to-purple text-white font-semibold rounded-lg hover:from-primary-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
							>
								<span className="mr-2">🎯</span>
								{t("cta")}
								<span className="ml-2">→</span>
							</Link>
						</div>
					</div>
				</div>
			</section>

			<StatsSection />
			<Footer />
		</div>
	);
}
