import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const imageConfig: NextConfig["images"] = {
	remotePatterns: [
		{
			protocol: "https",
			hostname: "i.ytimg.com",
			pathname: "/**",
		},
		{
			protocol: "https",
			hostname: "**.udemycdn.com",
			pathname: "/**",
		},
	],
};

const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;

if (mediaUrl) {
	try {
		const parsed = new URL(mediaUrl);
		imageConfig.remotePatterns?.push({
			protocol: parsed.protocol.replace(":", "") as "http" | "https",
			hostname: parsed.hostname,
			port: parsed.port || undefined,
			pathname: "/**",
		});
	} catch (error) {
		console.warn("Invalid NEXT_PUBLIC_MEDIA_URL provided:", error);
	}
}

const nextConfig: NextConfig = {
	output: "standalone", // enable standalone output for docker
	images: imageConfig,
};

export default withNextIntl(nextConfig);
