const defaultPublicBackendUrl = "http://localhost:4000/api";

function normalizeUrl(url: string): string {
	return url.replace(/\/+$/, "");
}

export function getPublicBackendUrl(): string {
	return normalizeUrl(process.env.NEXT_PUBLIC_BACKEND_URL || defaultPublicBackendUrl);
}

export function getServerBackendUrl(): string {
	return normalizeUrl(process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || defaultPublicBackendUrl);
}

export function getRuntimeBackendUrl(): string {
	return typeof window === "undefined" ? getServerBackendUrl() : getPublicBackendUrl();
}
