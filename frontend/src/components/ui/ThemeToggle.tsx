"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		console.log("[ThemeToggle] Mounted with theme:", { theme, resolvedTheme });
	}, [resolvedTheme, theme]);

	useEffect(() => {
		console.log("[ThemeToggle] Theme state changed:", { theme, resolvedTheme });
	}, [theme, resolvedTheme]);

	// Don't render anything until mounted to avoid hydration mismatch
	if (!mounted) {
		return <div className="w-8 h-8" />; // Placeholder to maintain layout
	}

	const active = theme === "system" ? resolvedTheme : theme;
	const isLight = active === "light";

	function toggleTheme() {
		const newTheme = isLight ? "dark" : "light";
		console.log("[ThemeToggle] Switching from", active, "to", newTheme);
		setTheme(newTheme);

		// Debug HTML class after a short delay
		setTimeout(() => {
			console.log("[ThemeToggle] HTML classes after toggle:", document.documentElement.className);
		}, 100);
	}

	return (
		<button type="button" aria-label={`Switch to ${isLight ? "dark" : "light"} mode`} onClick={toggleTheme} className="relative p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900">
			{isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
		</button>
	);
}
