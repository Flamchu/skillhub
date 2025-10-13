"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { http } from "@/lib/http";
import { initiateGoogleLogin } from "@/lib/auth";

export default function LoginPage() {
	const t = useTranslations("auth.login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await http.post("/auth/login", {
				email: email.toLowerCase().trim(),
				password,
			});

			const { user, session } = response.data;

			if (session?.access_token) {
				// store the session token and user data for future requests
				const { setAuthData } = await import("@/lib/auth");
				setAuthData(session.access_token, session.refresh_token, user);

				// trigger auth context refresh
				window.dispatchEvent(new Event("auth-changed"));

				// redirect immediately
				router.push("/dashboard");
			}
		} catch (err) {
			console.error("Login error:", err);
			const errorMessage = err instanceof Error ? err.message : "Invalid credentials. Please try again.";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setLoading(true);
		setError("");

		try {
			const oauthUrl = await initiateGoogleLogin();
			// Redirect to Google OAuth URL
			window.location.href = oauthUrl;
		} catch (err) {
			console.error("Google login error:", err);
			setError("Failed to initiate Google login. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background-alt flex items-center justify-center px-6">
			<div className="max-w-md w-full">
				{/* header */}
				<div className="text-center mb-8">
					<Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
						SkillHub
					</Link>
					<h1 className="text-3xl font-bold text-foreground mt-4">{t("title")}</h1>
					<p className="text-foreground-muted mt-2">{t("subtitle")}</p>
				</div>

				{/* login form */}
				<div className="bg-surface border border-border rounded-sm shadow-sm p-8">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
								{t("email")}
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								required
								className="w-full px-3 py-2 bg-surface-muted border border-border rounded-sm text-foreground placeholder:text-foreground-subtle focus:border-border-focus focus:ring-2 focus:ring-primary-100 outline-none transition-all"
								placeholder={t("email")}
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
								{t("password")}
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								className="w-full px-3 py-2 bg-surface-muted border border-border rounded-sm text-foreground placeholder:text-foreground-subtle focus:border-border-focus focus:ring-2 focus:ring-primary-100 outline-none transition-all"
								placeholder={t("password")}
							/>
						</div>

						{error && (
							<div className="text-danger text-sm bg-danger-50 border border-danger rounded-sm p-4 font-medium">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
						>
							{loading ? "..." : t("submit")}
						</button>
					</form>

					{/* divider */}
					<div className="my-6 flex items-center">
						<div className="flex-1 border-t border-border" />
						<span className="px-4 text-sm text-foreground-muted">{t("or")}</span>
						<div className="flex-1 border-t border-border" />
					</div>

					{/* google login button */}
					<button
						onClick={handleGoogleLogin}
						disabled={loading}
						className="w-full px-4 py-2 bg-surface border border-border text-foreground rounded-sm hover:bg-surface-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base flex items-center justify-center gap-3"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						{t("continueWithGoogle")}
					</button>

					<div className="mt-8 text-center">
						<p className="text-foreground">
							{t("noAccount")}{" "}
							<Link
								href="/register"
								className="text-primary hover:text-primary-600 font-semibold hover:underline transition-colors"
							>
								{t("signUp")}
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
