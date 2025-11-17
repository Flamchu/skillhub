/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	// Note: darkMode is handled by @custom-variant in globals.css for Tailwind v4
	theme: {
		extend: {
			// Only define semantic colors that are NOT in @theme - these reference variables defined in the old CSS section
			colors: {
				// Semantic background colors - these stay as they reference the old CSS variable system
				background: {
					DEFAULT: "var(--color-background)",
					alt: "var(--color-background-alt)",
					muted: "var(--color-background-muted)",
				},
				// Surface colors for cards, modals, etc.
				surface: {
					DEFAULT: "var(--color-surface)",
					elevated: "var(--color-surface-elevated)",
					muted: "var(--color-surface-muted)",
					hover: "var(--color-surface-hover)",
					pressed: "var(--color-surface-pressed)",
				},
				// Border colors
				border: {
					DEFAULT: "var(--color-border)",
					divider: "var(--color-border-divider)",
					strong: "var(--color-border-strong)",
					focus: "var(--color-border-focus)",
				},
				// Text colors
				foreground: {
					DEFAULT: "var(--color-foreground)",
					alt: "var(--color-foreground-alt)",
					muted: "var(--color-foreground-muted)",
					subtle: "var(--color-foreground-subtle)",
					disabled: "var(--color-foreground-disabled)",
				},
				// NOTE: primary, success, warning, danger, info colors are automatically generated from @theme
				// No need to define them here - Tailwind v4 creates utilities from @theme variables automatically
			},
			// Custom border radius using CSS variables
			borderRadius: {
				xs: "var(--radius-xs)",
				sm: "var(--radius-sm)",
				md: "var(--radius-md)",
				lg: "var(--radius-lg)",
				xl: "var(--radius-xl)",
				"2xl": "var(--radius-2xl)",
				full: "var(--radius-full)",
				// aliases for common use cases
				button: "var(--radius-md)",
				card: "var(--radius-lg)",
				input: "var(--radius-md)",
				badge: "var(--radius-full)",
			},
			// Custom box shadows using CSS variables
			boxShadow: {
				xs: "var(--shadow-xs)",
				sm: "var(--shadow-sm)",
				md: "var(--shadow-md)",
				lg: "var(--shadow-lg)",
				xl: "var(--shadow-xl)",
			},
			// Custom animations for skeletons
			keyframes: {
				shimmer: {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" },
				},
				"shimmer-slide": {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(100%)" },
				},
			},
			animation: {
				shimmer: "shimmer 2s infinite linear",
				"shimmer-slide": "shimmer-slide 2s infinite linear",
			},
		},
	},
	plugins: [],
};
