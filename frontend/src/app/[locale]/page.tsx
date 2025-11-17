import { Navigation, HeroSection, FeaturesSection, StatsSection, Footer } from "@/components/landing";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Home - Professional Skill Development Platform",
	description:
		"Join thousands of learners mastering new skills with AI-powered course recommendations, interactive learning paths, and industry-recognized skill verification on SkillHub.",
	openGraph: {
		title: "SkillHub - Master Your Professional Skills",
		description:
			"AI-powered skill development platform with personalized course recommendations and skill verification.",
		url: "/",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "SkillHub Platform",
			},
		],
	},
};

export default function Home() {
	return (
		<div className="min-h-screen bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
			<Navigation />
			<HeroSection />
			<FeaturesSection />

			{/* AI Recommendations Section */}
			<section className="px-6 py-20">
				<div className="max-w-6xl mx-auto">
					<div className="bg-linear-to-r from-primary/10 via-purple/10 to-pink/10 rounded-3xl p-12 border border-primary/20">
						<div className="text-center mb-12">
							<div className="inline-flex items-center px-6 py-3 bg-linear-to-r from-primary/20 to-purple/20 text-primary rounded-full text-sm font-semibold mb-6 border border-primary/30">
								🤖 AI-Powered Learning
							</div>
							<h3 className="text-4xl md:text-5xl font-bold mb-6">
								<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
									Personalized Course Recommendations
								</span>
							</h3>
							<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
								Our intelligent algorithm analyzes your skills, learning goals, and interests to suggest the perfect
								courses for your journey. Get recommendations tailored specifically to your needs.
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8 mb-12">
							<div className="text-center">
								<div className="w-20 h-20 bg-linear-to-br from-primary to-purple rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
									<span className="text-3xl">🎯</span>
								</div>
								<h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Smart Matching</h4>
								<p className="text-gray-600 dark:text-gray-300">
									Advanced algorithms match courses to your current skill level and learning objectives
								</p>
							</div>

							<div className="text-center">
								<div className="w-20 h-20 bg-linear-to-br from-success to-info rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
									<span className="text-3xl">🚀</span>
								</div>
								<h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Skill Progression</h4>
								<p className="text-gray-600 dark:text-gray-300">
									Follow guided learning paths that build on your existing knowledge and expand your expertise
								</p>
							</div>

							<div className="text-center">
								<div className="w-20 h-20 bg-linear-to-br from-warning to-pink rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
									<span className="text-3xl">✨</span>
								</div>
								<h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">AI Skill Generator</h4>
								<p className="text-gray-600 dark:text-gray-300">
									Tell our AI about your goals and get instant skill recommendations to add to your profile
								</p>
							</div>
						</div>

						<div className="text-center">
							<Link
								href="/courses/recommended"
								className="inline-flex items-center px-8 py-4 bg-linear-to-r from-primary to-purple text-white font-semibold rounded-lg hover:from-primary-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
							>
								<span className="mr-2">🎯</span>
								Try AI Recommendations
								<span className="ml-2">→</span>
							</Link>
						</div>
					</div>
				</div>
			</section>

			<StatsSection />
			<Footer />
		</div>
	);
}
