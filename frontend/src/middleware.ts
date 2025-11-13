import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "./i18n";

// create the intl middleware
const intlMiddleware = createMiddleware({
	// list of all locales that are supported
	locales,

	// used when no locale matches
	defaultLocale: "en",
});

// check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
	// check for auth token in cookies (preferred for SSR)
	const authToken = request.cookies.get("auth_token")?.value;
	if (authToken) {
		return true;
	}

	// fallback: check authorization header
	const authHeader = request.headers.get("authorization");
	return !!(authHeader && authHeader.startsWith("Bearer "));
}

// get user role from stored user data
function getUserRole(request: NextRequest): string | null {
	// check for user data in cookies
	const userData = request.cookies.get("user")?.value;
	if (userData) {
		try {
			const user = JSON.parse(userData);
			return user.role || null;
		} catch {
			return null;
		}
	}
	return null;
}

export default function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// extract locale and clean pathname
	const localeMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
	const locale = localeMatch ? localeMatch[1] : "en";
	const cleanPath = localeMatch ? localeMatch[2] || "/" : pathname;

	// check authentication status
	const authenticated = isAuthenticated(request);
	const userRole = getUserRole(request);

	// redirect authenticated users from root page
	if (authenticated && cleanPath === "/") {
		const redirectPath = userRole === "ADMIN" ? `/${locale}/admin` : `/${locale}/dashboard`;
		return NextResponse.redirect(new URL(redirectPath, request.url));
	}

	// redirect authenticated users from auth pages
	if (authenticated && (cleanPath === "/auth" || cleanPath.startsWith("/auth/"))) {
		const redirectPath = userRole === "ADMIN" ? `/${locale}/admin` : `/${locale}/dashboard`;
		return NextResponse.redirect(new URL(redirectPath, request.url));
	}

	// run the intl middleware for all other requests
	return intlMiddleware(request);
}

export const config = {
	// match only internationalized pathnames
	matcher: ["/((?!api|_next|_vercel|.*\\.).*)"],
};
