"use client";

import { AuthenticatedNavbar } from "./AuthenticatedNavbar";

interface AuthenticatedLayoutProps {
	children: React.ReactNode;
}

/**
 * layout wrapper for authenticated pages
 * includes the navbar with xp bar
 */
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	return (
		<>
			<AuthenticatedNavbar />
			<div className="pt-16">{children}</div>
		</>
	);
}
