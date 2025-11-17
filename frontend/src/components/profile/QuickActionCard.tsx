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
			<div className="group relative overflow-hidden rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 transition-all hover:shadow-xl hover:scale-[1.03] hover:border-primary/50 cursor-pointer h-full flex flex-col active:scale-[0.98]">
				{/* icon and badge */}
				<div className="flex items-start justify-between mb-4">
					<div
						className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient} shadow-lg ring-2 ring-white/50 dark:ring-gray-700/50`}
					>
						<Icon className="w-6 h-6 text-primary-700 dark:text-primary-300" />
					</div>
					{badge && (
						<span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-primary/10 to-purple/10 text-primary-700 dark:text-primary-300 rounded-lg border-2 border-primary/20">
							{badge}
						</span>
					)}
				</div>

				{/* content */}
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
					{title}
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 grow leading-relaxed">{description}</p>

				{/* arrow indicator */}
				<div className="flex items-center text-primary text-sm font-bold mt-auto">
					<span className="group-hover:mr-2 transition-all">View</span>
					<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
				</div>

				{/* hover effect gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
			</div>
		</Link>
	);
}
