import { useTranslations } from "next-intl";
import { Zap, Award, Globe, ArrowRight } from "lucide-react";

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	linkText: string;
	colorScheme: "primary" | "success" | "warning";
}

function FeatureCard({ icon, title, description, linkText, colorScheme }: FeatureCardProps) {
	const colorClasses = {
		primary: {
			bg: "bg-linear-to-br from-primary/5 to-purple/5 dark:from-primary/10 dark:to-purple/10",
			border: "border-primary/20 dark:border-primary/30",
			hover:
				"hover:from-primary/10 hover:to-purple/10 dark:hover:from-primary/15 dark:hover:to-purple/15 hover:border-primary/40",
			iconBg: "bg-linear-to-br from-primary to-purple",
			titleHover: "group-hover:text-primary",
			linkColor: "text-primary",
		},
		success: {
			bg: "bg-linear-to-br from-success/5 to-info/5 dark:from-success/10 dark:to-info/10",
			border: "border-success/20 dark:border-success/30",
			hover:
				"hover:from-success/10 hover:to-info/10 dark:hover:from-success/15 dark:hover:to-info/15 hover:border-success/40",
			iconBg: "bg-linear-to-br from-success to-info",
			titleHover: "group-hover:text-success",
			linkColor: "text-success",
		},
		warning: {
			bg: "bg-linear-to-br from-warning/5 to-pink/5 dark:from-warning/10 dark:to-pink/10",
			border: "border-warning/20 dark:border-warning/30",
			hover:
				"hover:from-warning/10 hover:to-pink/10 dark:hover:from-warning/15 dark:hover:to-pink/15 hover:border-warning/40",
			iconBg: "bg-linear-to-br from-warning to-pink",
			titleHover: "group-hover:text-warning",
			linkColor: "text-warning",
		},
	};

	const colors = colorClasses[colorScheme];

	return (
		<div
			className={`group ${colors.bg} border-2 ${colors.border} rounded-2xl p-10 ${colors.hover} transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl backdrop-blur-sm`}
		>
			<div
				className={`w-20 h-20 ${colors.iconBg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}
			>
				<div className="text-white w-10 h-10">{icon}</div>
			</div>
			<h4
				className={`text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 ${colors.titleHover} transition-colors`}
			>
				{title}
			</h4>
			<p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-6">{description}</p>
			<div
				className={`inline-flex items-center gap-2 ${colors.linkColor} font-bold group-hover:gap-4 transition-all duration-300`}
			>
				{linkText}
				<ArrowRight className="w-5 h-5" />
			</div>
		</div>
	);
}

export function FeaturesSection() {
	const t = useTranslations("features");

	return (
		<div className="max-w-7xl mx-auto mt-32 px-6">
			<div className="text-center mb-24">
				<h3 className="text-5xl md:text-6xl font-extrabold mb-6">
					<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
						{t("title")}
					</span>
				</h3>
				<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
					{t("subtitle")}
				</p>
			</div>

			<div className="grid md:grid-cols-3 gap-8">
				<FeatureCard
					icon={<Zap className="w-full h-full" />}
					title={t("lightningFast.title")}
					description={t("lightningFast.description")}
					linkText={t("lightningFast.link")}
					colorScheme="primary"
				/>

				<FeatureCard
					icon={<Award className="w-full h-full" />}
					title={t("industryRecognized.title")}
					description={t("industryRecognized.description")}
					linkText={t("industryRecognized.link")}
					colorScheme="success"
				/>

				<FeatureCard
					icon={<Globe className="w-full h-full" />}
					title={t("globalCommunity.title")}
					description={t("globalCommunity.description")}
					linkText={t("globalCommunity.link")}
					colorScheme="warning"
				/>
			</div>
		</div>
	);
}
