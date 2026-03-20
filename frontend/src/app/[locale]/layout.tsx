import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getOpenGraphLocale } from "@/lib/i18n-utils";
import { loadMessages, locales, resolveLocale } from "@/i18n";
import { notFound } from "next/navigation";
import { AppProviders } from "./providers";
import "../globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export function generateStaticParams() {
	return locales.map(locale => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale: localeParam } = await params;
	const locale = resolveLocale(localeParam);
	const messages = await loadMessages(locale);
	const metadataMessages = messages.metadata.layout;

	return {
		title: {
			default: metadataMessages.title.default,
			template: metadataMessages.title.template,
		},
		description: metadataMessages.description,
		keywords: metadataMessages.keywords,
		authors: [{ name: "SkillHub" }],
		creator: "SkillHub",
		publisher: "SkillHub",
		metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
		manifest: `/${locale}/manifest.webmanifest`,
		icons: {
			icon: [
				{ url: "/favicon.svg", type: "image/svg+xml" },
				{ url: "/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
				{ url: "/favicon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
			],
			apple: [{ url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" }],
		},
		openGraph: {
			type: "website",
			locale: getOpenGraphLocale(locale),
			url: `/${locale}`,
			title: metadataMessages.openGraph.title,
			description: metadataMessages.openGraph.description,
			siteName: "SkillHub",
			images: [
				{
					url: "/og-image.png",
					width: 1200,
					height: 630,
					alt: metadataMessages.openGraph.imageAlt,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: metadataMessages.twitter.title,
			description: metadataMessages.twitter.description,
			images: ["/og-image.png"],
			creator: "@skillhub",
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		verification: {
			google: "google-site-verification-code-here",
		},
	};
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale: localeParam } = await params;
	const locale = resolveLocale(localeParam);
	// ensure that the incoming `locale` is valid
	if (!locales.includes(locale)) {
		notFound();
	}

	// Providing all messages to the client side
	const messages = await getMessages();

	return (
		<html
			lang={locale}
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable} transition-colors`}
		>
			<head />
			<body className="antialiased min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
				<NextIntlClientProvider messages={messages}>
					<AppProviders>{children}</AppProviders>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
