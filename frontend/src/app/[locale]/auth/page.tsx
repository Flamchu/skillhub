"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { http } from "@/lib/http";
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
