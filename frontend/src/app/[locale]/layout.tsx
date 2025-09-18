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
	title: "SkillHub",
	description: "Professional skill development platform",
};

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	// Ensure that the incoming `locale` is valid
	if (!locales.includes(locale as (typeof locales)[number])) {
		notFound();
	}

	// Providing all messages to the client side
	const messages = await getMessages();
	// minimal no-flash theme init: only sets dark early, does not try to unset (runtime sync handles light)
	const themeInit = `!function(){try{var k='skillhub-theme',v=localStorage.getItem(k);var sys=window.matchMedia('(prefers-color-scheme: dark)').matches;if(v==='dark'||(!v||v==='system')&&sys){document.documentElement.classList.add('dark')}}catch(e){}}();`;

	return (
		<html lang={locale} suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} transition-colors`}>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeInit }} />
			</head>
			<body className="antialiased min-h-screen bg-background text-foreground transition-colors">
				<NextIntlClientProvider messages={messages}>
					<AppProviders>{children}</AppProviders>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
