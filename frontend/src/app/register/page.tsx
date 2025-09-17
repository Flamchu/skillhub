"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { http } from "@/lib/http";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await http.post("/auth/register", {
				email: email.toLowerCase().trim(),
				password,
				name: name.trim(),
			});

			const { user } = response.data;

			if (user) {
				// redirect to login page after successful registration
				router.push("/login?message=Registration successful! Please sign in.");
			}
		} catch (err) {
			console.error("Registration error:", err);
			const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again.";
			setError(errorMessage);
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
					<h1 className="text-3xl font-bold text-foreground mt-4">Create account</h1>
					<p className="text-foreground-muted mt-2">Join SkillHub and start your learning journey</p>
				</div>

				{/* register form */}
				<div className="bg-surface border border-border rounded-sm shadow-sm p-8">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
								Full name
							</label>
							<input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-surface-muted border border-border rounded-sm text-foreground placeholder:text-foreground-subtle focus:border-border-focus focus:ring-2 focus:ring-primary-100 outline-none transition-all" placeholder="Enter your full name" />
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
								Email address
							</label>
							<input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-surface-muted border border-border rounded-sm text-foreground placeholder:text-foreground-subtle focus:border-border-focus focus:ring-2 focus:ring-primary-100 outline-none transition-all" placeholder="Enter your email address" />
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
								Password
							</label>
							<input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 bg-surface-muted border border-border rounded-sm text-foreground placeholder:text-foreground-subtle focus:border-border-focus focus:ring-2 focus:ring-primary-100 outline-none transition-all" placeholder="Create a password (min. 6 characters)" />
						</div>

						{error && <div className="text-danger text-sm bg-danger-50 border border-danger rounded-sm p-4 font-medium">{error}</div>}

						<button type="submit" disabled={loading} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base">
							{loading ? "Creating account..." : "Create account"}
						</button>
					</form>

					<div className="mt-8 text-center">
						<p className="text-foreground">
							Already have an account?{" "}
							<Link href="/login" className="text-primary hover:text-primary-600 font-semibold hover:underline transition-colors">
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
