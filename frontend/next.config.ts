import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
	output: "standalone", // enable standalone output for docker
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "i.ytimg.com",
				pathname: "/**",
			},
		],
	},
};

export default withNextIntl(nextConfig);
