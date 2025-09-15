import axios, { type InternalAxiosRequestConfig, type AxiosError, AxiosHeaders } from "axios";
import axiosRetry from "axios-retry";
import { nanoid } from "nanoid";
import { getAccessToken } from "./tokens";

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
	// ensure headers is an axiosheaders instance
	if (!config.headers) {
		config.headers = new AxiosHeaders();
	} else if (!(config.headers instanceof AxiosHeaders)) {
		// Convert plain object to AxiosHeaders
		config.headers = new AxiosHeaders(config.headers as Record<string, string>);
	}
	(config.headers as AxiosHeaders).set("X-Request-Id", nanoid());
	const token = await getAccessToken();
	if (token) (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
	return config as RetryableConfig;
});

http.interceptors.response.use(
	(r) => r,
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
		};
	}
);

axiosRetry(http, {
	retries: 2,
	retryDelay: axiosRetry.exponentialDelay,
	retryCondition: (err) => !err.response || err.response.status >= 500,
});

// example helpers for typed responses
export const api = {
	getSkill: <T = unknown>(id: string) => http.get<T>(`/skills/${id}`).then((r) => r.data),
	listSkills: <T = unknown>(params?: QueryParams) => http.get<T>("/skills", { params }).then((r) => r.data),
	getMe: () => http.get("/auth/me").then((r) => r.data),
};
