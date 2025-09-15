"use client";
import React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
	src?: string;
	alt?: string;
	name?: string;
	size?: "sm" | "md" | "lg" | "xl";
	fallbackBg?: string;
}

export function Avatar({ src, alt, name, size = "md", fallbackBg, className, ...props }: AvatarProps) {
	// size options for avatar
	const sizes = {
		sm: "h-8 w-8 text-xs",
		md: "h-10 w-10 text-sm",
		lg: "h-12 w-12 text-base",
		xl: "h-16 w-16 text-lg",
	};

	// background colors for fallback
	const backgroundColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500"];

	// generate a consistent background color based on name
	const getBackgroundColor = () => {
		if (fallbackBg) return fallbackBg;
		if (!name) return "bg-gray-500";

		const index = name.charCodeAt(0) % backgroundColors.length;
		return backgroundColors[index];
	};

	const displayName = alt || name || "User";
	const initials = name ? getInitials(name) : "?";

	return (
		<div className={cn("relative inline-flex items-center justify-center rounded-full overflow-hidden", sizes[size], className)} {...props}>
			{src ? <Image src={src} alt={displayName} fill className="object-cover" /> : <div className={cn("h-full w-full flex items-center justify-center text-white font-medium", getBackgroundColor())}>{initials}</div>}
		</div>
	);
}

interface AvatarGroupProps {
	avatars: Array<{
		src?: string;
		alt?: string;
		name?: string;
	}>;
	max?: number;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
}

export function AvatarGroup({ avatars, max = 5, size = "md", className }: AvatarGroupProps) {
	const displayAvatars = avatars.slice(0, max);
	const remainingCount = avatars.length - max;

	return (
		<div className={cn("flex -space-x-2", className)}>
			{displayAvatars.map((avatar, index) => (
				<Avatar key={index} {...avatar} size={size} className="border-2 border-white dark:border-gray-800" />
			))}
			{remainingCount > 0 && <div className={cn("relative inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium border-2 border-white dark:border-gray-800", size === "sm" && "h-8 w-8 text-xs", size === "md" && "h-10 w-10 text-sm", size === "lg" && "h-12 w-12 text-base", size === "xl" && "h-16 w-16 text-lg")}>+{remainingCount}</div>}
		</div>
	);
}
