"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { http } from "@/lib/http";

export default function LoginPage() {
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
				console.log("Login successful, storing data and redirecting");
				// store the session token for future requests
				localStorage.setItem("auth_token", session.access_token);
				localStorage.setItem("refresh_token", session.refresh_token);
				localStorage.setItem("user", JSON.stringify(user));

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

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6">
			<div className="max-w-md w-full">
				{/* header */}
				<div className="text-center mb-8">
					<Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
						SkillHub
					</Link>
					<h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome back</h1>
					<p className="text-gray-600 mt-2">Sign in to your account to continue learning</p>
				</div>

				{/* login form */}
				<div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
								Email address
							</label>
							<input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 placeholder:text-gray-500" placeholder="Enter your email address" />
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
								Password
							</label>
							<input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200 placeholder:text-gray-500" placeholder="Enter your password" />
						</div>

						{error && <div className="text-red-700 text-sm bg-red-100 border border-red-200 p-4 rounded-lg font-medium">{error}</div>}

						<button type="submit" disabled={loading} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all duration-200 font-semibold text-base shadow-sm">
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</form>

					<div className="mt-8 text-center">
						<p className="text-gray-700">
							Don&apos;t have an account?{" "}
							<Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors">
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
