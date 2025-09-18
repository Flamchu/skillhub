"use client";
import React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthProvider";
import { AnalyticsComponent } from "@/lib/analytics";

const qc = new QueryClient();
const defaultTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME || "system";

console.log("[AppProviders] Environment check:", {
	NODE_ENV: process.env.NODE_ENV,
	NEXT_PUBLIC_DEFAULT_THEME: process.env.NEXT_PUBLIC_DEFAULT_THEME,
	defaultTheme: defaultTheme,
	isClient: typeof window !== "undefined",
});

export function AppProviders({ children }: { children: React.ReactNode }) {
	console.log("[AppProviders] Rendering with defaultTheme:", defaultTheme);

	return (
		<ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem storageKey="skillhub-theme" disableTransitionOnChange={false}>
			<QueryClientProvider client={qc}>
				<AuthProvider>
					{children}
					<AnalyticsComponent />
					{process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
				</AuthProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
