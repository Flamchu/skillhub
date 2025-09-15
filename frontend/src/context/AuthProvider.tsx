"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/http";
import type { UserProfile } from "@/types";

interface ApiMeResponse {
	user: UserProfile;
}

interface AuthState {
	user: UserProfile | null;
	profile: UserProfile | null;
	loading: boolean;
	refresh: () => Promise<void>;
	logout: () => void;
}

// safe default; replaced after provider mounts
const AuthCtx = createContext<AuthState>({
	user: null,
	profile: null,
	loading: true,
	refresh: async () => {},
	logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		setLoading(true);

		// check if we're on the client side
		if (typeof window === "undefined") {
			setLoading(false);
			return;
		}

		// check if we have a stored token
		const token = localStorage.getItem("auth_token");
		const storedUser = localStorage.getItem("user");
		console.log("AuthProvider load:", { hasToken: !!token, hasStoredUser: !!storedUser });

		if (token && storedUser) {
			try {
				// parse and trust the stored user data immediately
				const userData = JSON.parse(storedUser) as UserProfile;
				console.log("Setting user from localStorage:", userData);
				setUser(userData);
				setProfile(userData);
				setLoading(false); // set loading false immediately when we have user data

				// optionally verify token in background (don't await this)
				api
					.getMe()
					.then((response) => {
						// The API returns { user: userProfile }, so we need to extract the user
						const apiResponse = response as ApiMeResponse;
						const userProfile = apiResponse.user;
						console.log("Updated user from API:", userProfile);
						setUser(userProfile);
						setProfile(userProfile);

						// Update localStorage with fresh data
						if (typeof window !== "undefined") {
							localStorage.setItem("user", JSON.stringify(userProfile));
						}
					})
					.catch((apiError) => {
						console.warn("API call failed, keeping stored user data", apiError);
						// keep the stored user data, don't clear it unless token is definitely invalid
					});

				return; // exit early to avoid setting loading to false again
			} catch (e) {
				// if stored data is corrupted, clear everything
				console.warn("failed to parse stored user data", e);
				localStorage.removeItem("auth_token");
				localStorage.removeItem("refresh_token");
				localStorage.removeItem("user");
				setUser(null);
				setProfile(null);
			}
		} else {
			console.log("No token or stored user found");
			setUser(null);
			setProfile(null);
		}
		setLoading(false);
	}, []);

	const logout = useCallback(() => {
		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_token");
			localStorage.removeItem("refresh_token");
			localStorage.removeItem("user");
		}
		setUser(null);
		setProfile(null);
	}, []);

	useEffect(() => {
		load();

		// listen for storage changes (e.g., after login in another tab or programmatic changes)
		const handleStorageChange = () => {
			load();
		};

		if (typeof window !== "undefined") {
			window.addEventListener("storage", handleStorageChange);
			// also listen for a custom event we can trigger after login
			window.addEventListener("auth-changed", handleStorageChange);
		}

		return () => {
			if (typeof window !== "undefined") {
				window.removeEventListener("storage", handleStorageChange);
				window.removeEventListener("auth-changed", handleStorageChange);
			}
		};
	}, [load]);

	return <AuthCtx.Provider value={{ user, profile, loading, refresh: load, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
