import { useTranslations } from "next-intl";

interface FeatureCardProps {
	icon: string;
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
			hover: "hover:from-primary/10 hover:to-purple/10 dark:hover:from-primary/15 dark:hover:to-purple/15",
			iconBg: "bg-linear-to-br from-primary to-purple",
			titleHover: "group-hover:text-primary",
			linkColor: "text-primary",
		},
		success: {
			bg: "bg-linear-to-br from-success/5 to-info/5 dark:from-success/10 dark:to-info/10",
			border: "border-success/20 dark:border-success/30",
			hover: "hover:from-success/10 hover:to-info/10 dark:hover:from-success/15 dark:hover:to-info/15",
			iconBg: "bg-linear-to-br from-success to-info",
			titleHover: "group-hover:text-success",
			linkColor: "text-success",
		},
		warning: {
			bg: "bg-linear-to-br from-warning/5 to-pink/5 dark:from-warning/10 dark:to-pink/10",
			border: "border-warning/20 dark:border-warning/30",
			hover: "hover:from-warning/10 hover:to-pink/10 dark:hover:from-warning/15 dark:hover:to-pink/15",
			iconBg: "bg-linear-to-br from-warning to-pink",
			titleHover: "group-hover:text-warning",
			linkColor: "text-warning",
		},
	};

	const colors = colorClasses[colorScheme];

	return (
		<div
			className={`group ${colors.bg} border ${colors.border} rounded-xl p-8 ${colors.hover} transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}
		>
			<div
				className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
			>
				<span className="text-2xl">{icon}</span>
			</div>
			<h4 className={`text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 ${colors.titleHover} transition-colors`}>
				{title}
			</h4>
			<p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{description}</p>
			<div
				className={`mt-6 inline-flex items-center ${colors.linkColor} font-semibold group-hover:translate-x-2 transition-transform`}
			>
				{linkText} →
			</div>
		</div>
	);
}

export function FeaturesSection() {
	const t = useTranslations("features");

	return (
		<div className="max-w-7xl mx-auto mt-32">
			<div className="text-center mb-20">
				<h3 className="text-4xl md:text-5xl font-bold mb-4">
					<span className="bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
						{t("title")}
					</span>
				</h3>
				<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t("subtitle")}</p>
			</div>

			<div className="grid md:grid-cols-3 gap-10">
				<FeatureCard
					icon="⚡"
					title={t("lightningFast.title")}
					description={t("lightningFast.description")}
					linkText={t("lightningFast.link")}
					colorScheme="primary"
				/>

				<FeatureCard
					icon="🏅"
					title={t("industryRecognized.title")}
					description={t("industryRecognized.description")}
					linkText={t("industryRecognized.link")}
					colorScheme="success"
				/>

				<FeatureCard
					icon="🌍"
					title={t("globalCommunity.title")}
					description={t("globalCommunity.description")}
					linkText={t("globalCommunity.link")}
					colorScheme="warning"
				/>
			</div>
		</div>
	);
}
