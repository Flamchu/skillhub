import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
	variant?: "default" | "rounded" | "circular";
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({ className, variant = "default" }: SkeletonProps) {
	const variantClasses = {
		default: "rounded-lg",
		rounded: "rounded-xl",
		circular: "rounded-full",
	};

	return (
		<div
			className={cn(
				"animate-pulse bg-linear-to-r from-gray-200/60 via-gray-100/60 to-gray-200/60 dark:from-gray-800/60 dark:via-gray-700/60 dark:to-gray-800/60",
				"bg-size-[200%_100%] animate-shimmer",
				variantClasses[variant],
				className
			)}
		/>
	);
}

/**
 * Skeleton with shimmer effect (more modern)
 */
export function SkeletonShimmer({ className, variant = "default" }: SkeletonProps) {
	const variantClasses = {
		default: "rounded-lg",
		rounded: "rounded-xl",
		circular: "rounded-full",
	};

	return (
		<div className={cn("relative overflow-hidden", variantClasses[variant], className)}>
			<div className="absolute inset-0 bg-gray-200/80 dark:bg-gray-800/80" />
			<div className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-linear-to-r from-transparent via-white/40 dark:via-gray-600/40 to-transparent" />
		</div>
	);
}

/**
 * Card skeleton with shimmer
 */
export function CardSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-200/50 dark:border-gray-700/50",
				className
			)}
		>
			<div className="flex items-start space-x-4">
				<SkeletonShimmer variant="rounded" className="w-12 h-12 shrink-0" />
				<div className="flex-1 space-y-3">
					<SkeletonShimmer className="h-6 w-3/4" />
					<SkeletonShimmer className="h-4 w-full" />
					<SkeletonShimmer className="h-4 w-2/3" />
				</div>
			</div>
		</div>
	);
}

/**
 * List item skeleton
 */
export function ListItemSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("flex items-center space-x-4", className)}>
			<SkeletonShimmer variant="circular" className="w-10 h-10 shrink-0" />
			<div className="flex-1 space-y-2">
				<SkeletonShimmer className="h-5 w-1/2" />
				<SkeletonShimmer className="h-4 w-3/4" />
			</div>
		</div>
	);
}

/**
 * Course card skeleton
 */
export function CourseCardSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden",
				className
			)}
		>
			<SkeletonShimmer className="w-full h-48" variant="default" />
			<div className="p-6 space-y-4">
				<SkeletonShimmer className="h-7 w-3/4" />
				<SkeletonShimmer className="h-4 w-full" />
				<SkeletonShimmer className="h-4 w-5/6" />
				<div className="flex items-center justify-between pt-4">
					<SkeletonShimmer className="h-5 w-20" />
					<SkeletonShimmer className="h-10 w-24" variant="rounded" />
				</div>
			</div>
		</div>
	);
}

/**
 * Stats card skeleton
 */
export function StatsCardSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-200/50 dark:border-gray-700/50",
				className
			)}
		>
			<div className="flex items-center space-x-4">
				<SkeletonShimmer variant="rounded" className="w-12 h-12" />
				<SkeletonShimmer className="h-10 w-16" />
			</div>
			<SkeletonShimmer className="h-4 w-24 mt-3" />
		</div>
	);
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 4, className }: { columns?: number; className?: string }) {
	return (
		<div className={cn("grid gap-4", className)} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
			{Array.from({ length: columns }).map((_, i) => (
				<SkeletonShimmer key={i} className="h-6 w-full" />
			))}
		</div>
	);
}

/**
 * Avatar skeleton
 */
export function AvatarSkeleton({ className }: { className?: string }) {
	return <SkeletonShimmer variant="circular" className={cn("w-10 h-10", className)} />;
}

/**
 * Text skeleton
 */
export function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
	return (
		<div className={cn("space-y-2", className)}>
			{Array.from({ length: lines }).map((_, i) => (
				<SkeletonShimmer key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
			))}
		</div>
	);
}
