import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
	images: {
		domains: ["i.ytimg.com"], // allow YouTube thumbnail images
	},
};

export default withNextIntl(nextConfig);
