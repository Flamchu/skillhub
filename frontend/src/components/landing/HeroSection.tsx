import { useTranslations } from "next-intl";
import Link from "next/link";
import { Sparkles, Rocket, Target } from "lucide-react";

export function HeroSection() {
	const t = useTranslations("hero");

	return (
		<main className="relative px-6 py-32 overflow-hidden">
			{/* Animated Background Elements */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
				<div
					className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "1s" }}
				/>
				<div
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink/10 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-6xl mx-auto text-center">
				{/* Badge with animation */}
				<div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
					<span className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-success/10 to-info/10 dark:from-success/20 dark:to-info/20 text-success dark:text-success-400 rounded-full text-sm font-bold border-2 border-success/30 dark:border-success-400/30 shadow-lg backdrop-blur-sm hover:scale-105 transition-transform duration-300">
						<Sparkles className="w-4 h-4" />
						{t("badge")}
					</span>
				</div>

				{/* Main Heading with staggered animation */}
				<h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
					<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text drop-shadow-sm">
						{t("title")}
					</span>
					<br />
					<span className="text-gray-900 dark:text-gray-100 text-5xl md:text-7xl mt-4 block">{t("subtitle")}</span>
				</h1>

				{/* Description with animation */}
				<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-14 max-w-4xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
					{t("description")}
				</p>

				{/* CTA Buttons with enhanced design */}
				<div className="flex flex-col sm:flex-row gap-6 justify-center mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
					<Link
						href="/auth"
						className="group relative px-12 py-5 bg-linear-to-r from-primary via-purple to-pink text-white rounded-2xl hover:shadow-2xl transition-all duration-300 text-xl font-bold text-center overflow-hidden hover:scale-105"
					>
						<span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
						<span className="relative flex items-center justify-center gap-3">
							<Rocket className="w-6 h-6" />
							{t("cta.start")}
							<span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
						</span>
					</Link>
					<Link
						href="/skills"
						className="group px-12 py-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl hover:border-primary dark:hover:border-primary hover:shadow-2xl transition-all duration-300 text-xl font-bold text-center hover:scale-105"
					>
						<span className="flex items-center justify-center gap-3">
							<Target className="w-6 h-6" />
							{t("cta.browse")}
						</span>
					</Link>
				</div>

				{/* Feature Pills with staggered animation */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
					{[
						{ icon: "💡", text: t("features.interactive"), delay: "400", gradient: "from-primary/10 to-purple/5" },
						{ icon: "🎯", text: t("features.goalOriented"), delay: "500", gradient: "from-success/10 to-info/5" },
						{ icon: "👥", text: t("features.community"), delay: "600", gradient: "from-warning/10 to-pink/5" },
						{ icon: "🏆", text: t("features.certified"), delay: "700", gradient: "from-info/10 to-success/5" },
					].map((feature, index) => (
						<div
							key={index}
							className={`group p-6 bg-linear-to-br ${feature.gradient} dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 hover:scale-105`}
							style={{ animationDelay: `${feature.delay}ms` }}
						>
							<div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
								{feature.icon}
							</div>
							<p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-bold">{feature.text}</p>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
