// supabase client removed - using backend auth instead
// if you need supabase client in the future, create it in a separate file

import type { UserProfile } from "@/types";

// helper function to set cookies with proper security settings
function setCookie(name: string, value: string, days = 7) {
	if (typeof document === "undefined") return;

	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

	document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
}

// helper function to remove cookies
function removeCookie(name: string) {
	if (typeof document === "undefined") return;

	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`;
}

// store authentication data in both localStorage and cookies
export function setAuthData(token: string, refreshToken: string, user: UserProfile) {
	if (typeof window === "undefined") return;

	// set in localStorage for client-side use
	localStorage.setItem("auth_token", token);
	localStorage.setItem("refresh_token", refreshToken);
	localStorage.setItem("user", JSON.stringify(user));

	// set in cookies for server-side middleware access
	setCookie("auth_token", token);
	setCookie("user", JSON.stringify(user));
}

// clear authentication data from both localStorage and cookies
export function clearAuthData() {
	if (typeof window === "undefined") return;

	// clear localStorage
	localStorage.removeItem("auth_token");
	localStorage.removeItem("refresh_token");
	localStorage.removeItem("user");

	// clear cookies
	removeCookie("auth_token");
	removeCookie("user");
}

// update user data in both localStorage and cookies
export function updateUserData(user: UserProfile) {
	if (typeof window === "undefined") return;

	localStorage.setItem("user", JSON.stringify(user));
	setCookie("user", JSON.stringify(user));
}

export async function getAccessToken(forceRefresh = false): Promise<string | null> {
	// check if we're on the client side
	if (typeof window === "undefined") {
		return null;
	}

	if (forceRefresh) {
		// try to refresh the token using the refresh token
		const refreshToken = localStorage.getItem("refresh_token");
		if (refreshToken) {
			try {
				// call your backend refresh endpoint
				const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ refresh_token: refreshToken }),
				});

				if (response.ok) {
					const data = await response.json();
					localStorage.setItem("auth_token", data.session.access_token);
					localStorage.setItem("refresh_token", data.session.refresh_token);

					// update auth cookie as well
					setCookie("auth_token", data.session.access_token);

					return data.session.access_token;
				}
			} catch (e) {
				console.warn("Token refresh failed", e);
			}
		}
		return null;
	}

	return localStorage.getItem("auth_token");
}

// google oauth functions
export async function initiateGoogleLogin(): Promise<string> {
	const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/oauth/initiate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			provider: "google",
			redirectUrl: `${window.location.origin}/auth/callback`,
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to initiate Google login");
	}

	const data = await response.json();
	return data.url;
}

export async function handleOAuthCallback(code: string, state: string) {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		}
	);

	if (!response.ok) {
		throw new Error("OAuth callback failed");
	}

	return response.json();
}
