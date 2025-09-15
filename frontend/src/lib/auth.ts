// supabase client removed - using backend auth instead
// if you need supabase client in the future, create it in a separate file

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
