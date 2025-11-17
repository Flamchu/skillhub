"use client";

import type { ReactNode } from "react";

interface PageLayoutProps {
	children: ReactNode;
	className?: string;
}

/**
 * Main page layout wrapper with gradient background
 */
export function PageLayout({ children, className = "" }: PageLayoutProps) {
	return (
		<div
			className={`min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}
		>
			<div className="max-w-7xl mx-auto p-6">{children}</div>
		</div>
	);
}
