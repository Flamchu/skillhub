import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// merge class names with tailwind-merge
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// format date to a readable string
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return dateObj.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		...options,
	});
}

// format relative time from a date
export function formatRelativeTime(date: Date | string): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffInMs = now.getTime() - dateObj.getTime();
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInDays === 0) return "today";
	if (diffInDays === 1) return "yesterday";
	if (diffInDays < 7) return `${diffInDays} days ago`;
	if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
	if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
	return `${Math.floor(diffInDays / 365)} years ago`;
}

// debounce a function
export function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}

// capitalize the first letter of a string
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// pluralize a word based on count
export function pluralize(count: number, singular: string, plural?: string): string {
	return count === 1 ? singular : plural || `${singular}s`;
}

// format proficiency level to a readable string
export function formatProficiencyLevel(level: string): string {
	return capitalize(level.replace("_", " "));
}

export function getInitials(name: string): string {
	return name
		.split(" ")
		.map((word) => word.charAt(0))
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function truncate(text: string, length: number): string {
	if (text.length <= length) return text;
	return text.slice(0, length) + "...";
}
