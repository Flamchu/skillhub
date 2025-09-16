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

	const currentTheme = theme === "system" ? resolvedTheme : theme;
	const isLight = currentTheme === "light";

	const toggleTheme = () => {
		const newTheme = isLight ? "dark" : "light";
		setTheme(newTheme);
	};

	return (
		<button 
			type="button" 
			aria-label={`Switch to ${isLight ? "dark" : "light"} mode`} 
			onClick={toggleTheme} 
			className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
		>
			{isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
		</button>
	);
}
