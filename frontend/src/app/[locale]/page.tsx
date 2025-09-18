import { Navigation, HeroSection, FeaturesSection, StatsSection, Footer } from "@/components/landing";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-foreground">
			<Navigation />
			<HeroSection />
			<FeaturesSection />
			<StatsSection />
			<Footer />
		</div>
	);
}
