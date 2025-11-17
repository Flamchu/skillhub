"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
	title: string;
	description: string;
	icon: LucideIcon;
	href: string;
	badge?: string;
	gradient?: string;
}

export function QuickActionCard({ title, description, icon: Icon, href, badge, gradient }: QuickActionCardProps) {
	// default gradient if none provided
	const bgGradient = gradient || "from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20";

	return (
		<Link href={href} className="h-full">
			<div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer h-full flex flex-col">
				{/* icon and badge */}
				<div className="flex items-start justify-between mb-4">
					<div className={`p-3 rounded-lg bg-linear-to-br ${bgGradient}`}>
						<Icon className="w-6 h-6 text-primary-700 dark:text-primary-300" />
					</div>
					{badge && (
						<span className="px-2.5 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-sm">
							{badge}
						</span>
					)}
				</div>

				{/* content */}
				<h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
				<p className="text-sm text-foreground-muted mb-4 grow">{description}</p>

				{/* arrow indicator */}
				<div className="flex items-center text-primary text-sm font-medium mt-auto">
					<span className="group-hover:mr-2 transition-all">View</span>
					<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
				</div>

				{/* hover effect gradient */}
				<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-purple/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
			</div>
		</Link>
	);
}
