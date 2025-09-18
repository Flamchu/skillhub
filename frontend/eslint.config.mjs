import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),
	...compat.extends("prettier"), // must be last to override other rules
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		rules: {
			// custom rules for tailwind v4 support and code quality
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			// prefer const for component props and variables that don't change
			"prefer-const": "warn",
			// enforce consistent component naming
			"@typescript-eslint/naming-convention": [
				"warn",
				{
					selector: ["function"],
					format: ["PascalCase", "camelCase"],
					filter: {
						regex: "^(default|use[A-Z])",
						match: false,
					},
				},
				{
					selector: ["variable"],
					format: ["camelCase", "PascalCase", "UPPER_CASE"],
					filter: {
						regex: "^(React|Component|JSX)",
						match: false,
					},
				},
			],
			// warn about console statements in production builds
			"no-console": ["warn", { allow: ["warn", "error"] }],
			// enforce proper import sorting
			"@typescript-eslint/no-explicit-any": "warn",
			// jsx/react specific
			"react/jsx-boolean-value": ["warn", "never"],
			"react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
			"react/self-closing-comp": "warn",
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	},
	{
		ignores: [
			"node_modules/**",
			".next/**",
			"out/**",
			"build/**",
			"next-env.d.ts",
			"*.config.*",
			"tailwind.config.js",
			"**/*.css", // ignore css files to avoid parsing Tailwind v4 @import and @theme syntax
			"postcss.config.*",
		],
	},
];

export default eslintConfig;
