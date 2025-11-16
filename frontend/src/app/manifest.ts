export default function manifest() {
	return {
		name: "SkillHub - Professional Skill Development Platform",
		short_name: "SkillHub",
		description: "Master new skills with AI-powered recommendations and interactive courses",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#7c3aed",
		icons: [
			{
				src: "/favicon.ico",
				sizes: "any",
				type: "image/x-icon",
			},
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
		categories: ["education", "productivity", "business"],
		lang: "en",
	};
}
