"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Don't render anything until mounted to avoid hydration mismatch
	if (!mounted) {
		return <div className="w-8 h-8" />; // Placeholder to maintain layout
	}

	const active = theme === "system" ? resolvedTheme : theme;
	const isLight = active === "light";

	function toggleTheme() {
		setTheme(isLight ? "dark" : "light");
	}

	return (
		<button type="button" aria-label={`switch to ${isLight ? "dark" : "light"} mode`} onClick={toggleTheme} className="relative p-2 rounded-button text-fg-muted hover:text-fg-default hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-bg-default">
			{isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
		</button>
	);
}
