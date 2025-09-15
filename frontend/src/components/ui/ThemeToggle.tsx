"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const active = theme === "system" ? resolvedTheme : theme;
	return (
		<button type="button" aria-label="Toggle theme" onClick={() => setTheme(active === "dark" ? "light" : "dark")} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition">
			{mounted && active === "dark" ? <Sun size={16} /> : <Moon size={16} />}
			<span className="hidden sm:inline">{mounted ? (active === "dark" ? "Light Mode" : "Dark Mode") : "Theme"}</span>
		</button>
	);
}
