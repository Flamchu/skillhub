import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "./providers";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
	// minimal no-flash theme init: only sets dark early, does not try to unset (runtime sync handles light)
	const themeInit = `!function(){try{var k='skillhub-theme',v=localStorage.getItem(k);var sys=window.matchMedia('(prefers-color-scheme: dark)').matches;if(v==='dark'||(!v||v==='system')&&sys){document.documentElement.classList.add('dark')}}catch(e){}}();`;

	return (
		<html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} transition-colors`}>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeInit }} />
			</head>
			<body className="antialiased min-h-screen bg-background text-foreground transition-colors">
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
