"use client";

import type { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	description?: string;
	action?: ReactNode;
	centered?: boolean;
	className?: string;
}

/**
 * Standardized page header with gradient text and optional action
 */
export function PageHeader({ title, description, action, centered = false, className = "" }: PageHeaderProps) {
	const containerClass = centered
		? "text-center mb-12"
		: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12";

	return (
		<div className={`${containerClass} ${className}`}>
			<div className={centered ? "" : "text-center sm:text-left"}>
				<h1 className="text-4xl md:text-5xl font-bold mb-4">
					<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
						{title}
					</span>
				</h1>
				{description && (
					<p
						className={`text-lg text-gray-600 dark:text-gray-300 max-w-2xl ${centered ? "mx-auto" : "mx-auto sm:mx-0"}`}
					>
						{description}
					</p>
				)}
			</div>
			{action && <div className="shrink-0">{action}</div>}
		</div>
	);
}
