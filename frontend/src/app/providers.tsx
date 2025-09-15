"use client";
import React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthProvider";
import { AnalyticsComponent } from "@/lib/analytics";

const qc = new QueryClient();
const defaultTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME || "system";

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem>
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
