"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { setAuthData } from "@/lib/auth";

export default function AuthCallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const t = useTranslations("auth");
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const processCallback = async () => {
			try {
				setStatus("loading");

				// Check for Supabase session in URL fragments
				const hashParams = new URLSearchParams(window.location.hash.substring(1));
				const accessToken = hashParams.get("access_token");
				const refreshToken = hashParams.get("refresh_token");

				// Check for error in URL
				const error = searchParams.get("error");
				const errorDescription = searchParams.get("error_description");

				if (error) {
					throw new Error(errorDescription || "OAuth authentication failed");
				}

				if (accessToken && refreshToken) {
					// We have tokens from Supabase OAuth
					// Now get user profile from our backend
					const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					});

					if (!response.ok) {
						throw new Error("Failed to get user profile");
					}

					const { user } = await response.json();

					// Store authentication data
					setAuthData(accessToken, refreshToken, user);

					// Trigger auth context refresh
					window.dispatchEvent(new Event("auth-changed"));

					setStatus("success");

					// Redirect to dashboard after a brief success message
					setTimeout(() => {
						router.push("/dashboard");
					}, 1500);
				} else {
					throw new Error("No authentication tokens received");
				}
			} catch (err) {
				console.error("OAuth callback error:", err);
				setStatus("error");
				setError(err instanceof Error ? err.message : "Authentication failed");

				// Redirect to login after showing error
				setTimeout(() => {
					router.push("/login");
				}, 3000);
			}
		};

		processCallback();
	}, [searchParams, router]);

	return (
		<div className="min-h-screen bg-background-alt flex items-center justify-center px-6">
			<div className="max-w-md w-full text-center">
				<div className="bg-surface border border-border rounded-sm shadow-sm p-8">
					{status === "loading" && (
						<div className="space-y-4">
							<div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
							<h1 className="text-xl font-semibold text-foreground">{t("completing_login")}</h1>
							<p className="text-foreground-muted">{t("processing_authentication")}</p>
						</div>
					)}

					{status === "success" && (
						<div className="space-y-4">
							<div className="w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center mx-auto">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<h1 className="text-xl font-semibold text-foreground">{t("login_successful")}</h1>
							<p className="text-foreground-muted">{t("redirecting_to_dashboard")}</p>
						</div>
					)}

					{status === "error" && (
						<div className="space-y-4">
							<div className="w-8 h-8 bg-danger text-danger-foreground rounded-full flex items-center justify-center mx-auto">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</div>
							<h1 className="text-xl font-semibold text-foreground">{t("login_failed")}</h1>
							<p className="text-danger text-sm">{error}</p>
							<p className="text-foreground-muted text-sm">{t("redirecting_to_login")}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
