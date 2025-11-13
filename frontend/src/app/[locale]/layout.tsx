import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "@/i18n";
import { notFound } from "next/navigation";
import { AppProviders } from "./providers";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
	title: "SkillHub",
	description: "Professional skill development platform",
};

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	// ensure that the incoming `locale` is valid
	if (!locales.includes(locale as (typeof locales)[number])) {
		notFound();
	}

	// Providing all messages to the client side
	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} transition-colors`}>
			<head />
			<body className="antialiased min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
				<NextIntlClientProvider messages={messages}>
					<AppProviders>
						{children}
						{/* Fixed Theme Toggle - appears on all pages */}
						<div className="fixed top-6 right-6 z-50">
							<ThemeToggle />
						</div>
					</AppProviders>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
