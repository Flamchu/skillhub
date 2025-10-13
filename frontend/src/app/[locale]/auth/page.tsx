"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { http } from "@/lib/http";
import { initiateGoogleLogin } from "@/lib/auth";
import { Navigation, Footer } from "@/components/landing";
import { GlassCard } from "@/components/ui";

type AuthMode = "login" | "register";

export default function AuthPage() {
	const [mode, setMode] = useState<AuthMode>("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const tLogin = useTranslations("auth.login");
	const tRegister = useTranslations("auth.register");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			if (mode === "login") {
				const response = await http.post("/auth/login", {
					email: email.toLowerCase().trim(),
					password,
				});

				const { user, session } = response.data;

				if (session?.access_token) {
					const { setAuthData } = await import("@/lib/auth");
					setAuthData(session.access_token, session.refresh_token, user);
					window.dispatchEvent(new Event("auth-changed"));
					router.push("/dashboard");
				}
			} else {
				const response = await http.post("/auth/register", {
					email: email.toLowerCase().trim(),
					password,
					name: name.trim(),
				});

				const { user } = response.data;

				if (user) {
					setMode("login");
					setError("");
					// Clear form except email
					setPassword("");
					setName("");
				}
			}
		} catch (err) {
			console.error(`${mode} error:`, err);
			const errorMessage =
				err instanceof Error
					? err.message
					: mode === "login"
						? "Invalid credentials. Please try again."
						: "Registration failed. Please try again.";
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

	const toggleMode = () => {
		setMode(mode === "login" ? "register" : "login");
		setError("");
		setPassword("");
		if (mode === "register") setName("");
	};

	const isLogin = mode === "login";

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
			<Navigation />

			<main className="px-6 py-20">
				<div className="max-w-md mx-auto">
					{/* Auth Card */}
					<GlassCard>
						{/* Header */}
						<div className="bg-gradient-to-r from-primary/5 to-purple/5 dark:from-primary/10 dark:to-purple/10 px-8 py-8 text-center border-b border-primary/10 dark:border-gray-700 rounded-t-2xl -m-6 mb-0 pt-12 pb-8">
							<div className="w-16 h-16 bg-gradient-to-br from-primary to-purple rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
								<span className="text-2xl text-white">{isLogin ? "👋" : "🚀"}</span>
							</div>
							<h1 className="text-3xl font-bold mb-2">
								<span className="bg-gradient-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
									{isLogin ? tLogin("title") : tRegister("title")}
								</span>
							</h1>
							<p className="text-gray-600 dark:text-gray-300 text-lg">
								{isLogin ? tLogin("subtitle") : tRegister("subtitle")}
							</p>
						</div>

						{/* Form */}
						<div className="p-8">
							<form onSubmit={handleSubmit} className="space-y-6">
								{!isLogin && (
									<div>
										<label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
											{tRegister("name")}
										</label>
										<input
											type="text"
											id="name"
											value={name}
											onChange={e => setName(e.target.value)}
											required={!isLogin}
											className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
											placeholder="Enter your full name"
										/>
									</div>
								)}

								<div>
									<label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
										{isLogin ? tLogin("email") : tRegister("email")}
									</label>
									<input
										type="email"
										id="email"
										value={email}
										onChange={e => setEmail(e.target.value)}
										required
										className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
										placeholder="Enter your email address"
									/>
								</div>

								<div>
									<label
										htmlFor="password"
										className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
									>
										{isLogin ? tLogin("password") : tRegister("password")}
									</label>
									<input
										type="password"
										id="password"
										value={password}
										onChange={e => setPassword(e.target.value)}
										required
										className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
										placeholder="Enter your password"
									/>
								</div>

								{error && (
									<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
										<p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
									</div>
								)}

								<button
									type="submit"
									disabled={loading}
									className="w-full px-8 py-4 bg-gradient-to-r from-primary to-purple text-white rounded-lg hover:from-primary-600 hover:to-purple-600 dark:hover:from-primary-500 dark:hover:to-purple-500 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
											{isLogin ? "Signing In..." : "Creating Account..."}
										</div>
									) : (
										<span className="flex items-center justify-center gap-2">
											{isLogin ? tLogin("submit") : tRegister("submit")}
											<span>{isLogin ? "→" : "🚀"}</span>
										</span>
									)}
								</button>
							</form>

							{/* OAuth Section */}
							<div className="mt-6">
								{/* Divider */}
								<div className="flex items-center my-6">
									<div className="flex-1 border-t border-gray-200 dark:border-gray-600" />
									<span className="px-4 text-sm text-gray-500 dark:text-gray-400">{tLogin("or")}</span>
									<div className="flex-1 border-t border-gray-200 dark:border-gray-600" />
								</div>

								{/* Google Login Button */}
								<button
									onClick={handleGoogleLogin}
									disabled={loading}
									className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-3"
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
									{tLogin("continueWithGoogle")}
								</button>
							</div>

							{/* Mode Toggle */}
							<div className="mt-8 text-center">
								<p className="text-gray-600 dark:text-gray-300 mb-3">
									{isLogin ? tLogin("noAccount") : tRegister("hasAccount")}
								</p>
								<button
									onClick={toggleMode}
									className="px-6 py-2 text-primary hover:text-purple font-semibold bg-gradient-to-r from-primary/5 to-purple/5 hover:from-primary/10 hover:to-purple/10 rounded-lg border border-primary/20 hover:border-primary/30 transition-all duration-200 transform hover:scale-105"
								>
									{isLogin ? tRegister("title") : tLogin("title")}
								</button>
							</div>
						</div>
					</GlassCard>

					{/* Back to Home */}
					<div className="text-center mt-8">
						<Link
							href="/"
							className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary font-medium transition-colors"
						>
							← Back to Home
						</Link>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
