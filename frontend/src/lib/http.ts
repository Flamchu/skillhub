import axios, { type InternalAxiosRequestConfig, type AxiosError, AxiosHeaders } from "axios";
import axiosRetry from "axios-retry";
import { nanoid } from "nanoid";
import { getAccessToken } from "./tokens";
import type { CreateCourseData, UpdateCourseData, CreateSkillData, UpdateSkillData, UpdateUserData } from "@/types";

interface RetryableConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

type Primitive = string | number | boolean | undefined | null;
export type QueryParams = Record<string, Primitive>;

interface ApiErrorPayload {
	error?: string;
	message?: string;
	details?: unknown;
	path?: string;
}

export const http = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	timeout: 15000,
});

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
	// ensure headers is axiosheaders
	if (!config.headers) {
		config.headers = new AxiosHeaders();
	} else if (!(config.headers instanceof AxiosHeaders)) {
		// convert to axiosheaders
		config.headers = new AxiosHeaders(config.headers as Record<string, string>);
	}
	(config.headers as AxiosHeaders).set("X-Request-Id", nanoid());
	const token = await getAccessToken();
	if (token) (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
	return config as RetryableConfig;
});

http.interceptors.response.use(
	r => r,
	async (error: AxiosError<ApiErrorPayload> & { config: RetryableConfig }) => {
		const { response, config } = error;
		if (response?.status === 401 && !config._retry) {
			config._retry = true;
			const token = await getAccessToken(true);
			if (token) {
				if (!config.headers) config.headers = new AxiosHeaders();
				if (!(config.headers instanceof AxiosHeaders)) {
					config.headers = new AxiosHeaders(config.headers as Record<string, string>);
				}
				(config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
				return http(config);
			}
		}
		const payload = response?.data;
		throw {
			status: response?.status,
			message: payload?.error || payload?.message || error.message,
			details: payload?.details,
			path: payload?.path,
			// preserve the full response data for special cases (like attemptId in 409 errors)
			data: payload,
		};
	}
);

axiosRetry(http, {
	retries: 2,
	retryDelay: axiosRetry.exponentialDelay,
	retryCondition: err => !err.response || err.response.status >= 500,
});

// typed api helpers
export const api = {
	getSkill: <T = unknown>(id: string) => http.get<T>(`/skills/${id}`).then(r => r.data),
	listSkills: <T = unknown>(params?: QueryParams) => http.get<T>("/skills", { params }).then(r => r.data),
	getMe: () => http.get("/auth/me").then(r => r.data),

	// courses api
	getCourses: (params?: QueryParams) => http.get("/courses", { params }).then(r => r.data),
	getCourse: (id: string) => http.get(`/courses/${id}`).then(r => r.data),
	createCourse: (data: CreateCourseData) => http.post("/courses", data).then(r => r.data),
	updateCourse: (id: string, data: UpdateCourseData) => http.patch(`/courses/${id}`, data).then(r => r.data),
	deleteCourse: (id: string) => http.delete(`/courses/${id}`).then(r => r.data),

	// skills api
	createSkill: (data: CreateSkillData) => http.post("/skills", data).then(r => r.data),
	updateSkill: (id: string, data: UpdateSkillData) => http.patch(`/skills/${id}`, data).then(r => r.data),
	deleteSkill: (id: string) => http.delete(`/skills/${id}`).then(r => r.data),

	// users api (admin)
	getUsers: (params?: QueryParams) => http.get("/users", { params }).then(r => r.data),
	getUser: (id: string) => http.get(`/users/${id}`).then(r => r.data),
	updateUser: (id: string, data: UpdateUserData) => http.patch(`/users/${id}`, data).then(r => r.data),
	deleteUser: (id: string) => http.delete(`/users/${id}`).then(r => r.data),

	// dashboard api (admin)
	getDashboardStats: () => http.get("/dashboard/stats").then(r => r.data),

	// user skills api (protected)
	getUserSkills: (userId: string, params?: QueryParams) =>
		http.get(`/users/${userId}/skills`, { params }).then(r => r.data),
	addUserSkill: (userId: string, data: { skillId: string; proficiency?: string; progress?: number }) =>
		http.post(`/users/${userId}/skills`, data).then(r => r.data),
	updateUserSkill: (userId: string, skillId: string, data: { proficiency?: string; progress?: number }) =>
		http.patch(`/users/${userId}/skills/${skillId}`, data).then(r => r.data),

	// public stats api (no auth required)
	getPublicStats: () => http.get("/stats").then(r => r.data),

	// regions api (public)
	getRegions: () => http.get("/regions").then(r => r.data),

	// profile api (protected)
	updateProfile: (data: UpdateUserData) => {
		// get current user from auth and update their profile
		return api.getMe().then((response: { user?: { id: string } }) => {
			const userId = response.user?.id;
			if (!userId) throw new Error("User not authenticated");
			return api.updateUser(userId, data);
		});
	},

	// enrollment api (protected)
	enrollInCourse: (courseId: string) => http.post(`/courses/${courseId}/enroll`).then(r => r.data),
	getUserEnrollments: (params?: QueryParams) => http.get("/courses/enrollments", { params }).then(r => r.data),

	// youtube import api (admin)
	importYouTubeCourse: (data: import("@/types").YouTubeImportData) =>
		http.post("/courses/import/youtube", data).then(r => r.data),
	generateCourseSummaries: () => http.post("/courses/generate-summaries").then(r => r.data),
	generateCourseSummary: (courseId: string) => http.post(`/courses/${courseId}/generate-summary`).then(r => r.data),

	// danger zone api (protected)
	clearUserData: (userId: string) => http.post(`/users/${userId}/clear-data`).then(r => r.data),
	deleteAccount: (userId: string) => http.delete(`/users/${userId}/account`).then(r => r.data),
};
