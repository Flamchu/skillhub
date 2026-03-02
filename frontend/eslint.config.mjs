import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = [
	...nextCoreWebVitals,
	...nextTypescript,
	prettier, // must be last to override other rules
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			// custom rules for tailwind v4 support and code quality
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
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
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		rules: {
			// prefer const for component props and variables that don't change
			"prefer-const": "warn",
			// warn about console statements in production builds
			"no-console": ["warn", { allow: ["warn", "error"] }],
			// enforce proper import sorting
			// jsx/react specific
			"react/jsx-boolean-value": ["warn", "never"],
			"react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
			"react/self-closing-comp": "warn",
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/static-components": "off",
			"react-hooks/purity": "off",
			"react-hooks/immutability": "off",
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
			"eslint.config.mjs",
			"tailwind.config.js",
			"**/*.css", // ignore css files to avoid parsing Tailwind v4 @import and @theme syntax
			"postcss.config.*",
		],
	},
];

export default eslintConfig;
