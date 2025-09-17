"use client";
import React, { useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthProvider";
import { AnalyticsComponent } from "@/lib/analytics";

const qc = new QueryClient();
const defaultTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME || "system";

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem disableTransitionOnChange storageKey="skillhub-theme">
			<ThemeClassEnforcer />
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

function ThemeClassEnforcer() {
	const { theme, resolvedTheme } = useTheme();
	useEffect(() => {
		const active = theme === "system" ? resolvedTheme : theme;
		const root = document.documentElement;
		if (active === "dark") root.classList.add("dark");
		else root.classList.remove("dark");
		if (process.env.NODE_ENV === "development") {
			console.log("[theme] preference=", theme, "resolved=", resolvedTheme, "html class=", root.className);
		}
	}, [theme, resolvedTheme]);
	return null;
}
