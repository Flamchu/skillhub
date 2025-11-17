import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@/i18n";
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

export const metadata: Metadata = {
	title: {
		default: "SkillHub - Professional Skill Development Platform",
		template: "%s | SkillHub",
	},
	description:
		"Master new skills with AI-powered recommendations, interactive courses, and skill verification. Build your professional profile and track your learning journey on SkillHub.",
	keywords: [
		"skill development",
		"online learning",
		"professional development",
		"skill verification",
		"AI recommendations",
		"career growth",
		"online courses",
		"skill tracking",
	],
	authors: [{ name: "SkillHub" }],
	creator: "SkillHub",
	publisher: "SkillHub",
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		title: "SkillHub - Professional Skill Development Platform",
		description:
			"Master new skills with AI-powered recommendations, interactive courses, and skill verification. Build your professional profile and track your learning journey.",
		siteName: "SkillHub",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "SkillHub - Professional Skill Development Platform",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "SkillHub - Professional Skill Development Platform",
		description: "Master new skills with AI-powered recommendations, interactive courses, and skill verification.",
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

export function generateStaticParams() {
	return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	// ensure that the incoming `locale` is valid
	if (!locales.includes(locale as (typeof locales)[number])) {
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
