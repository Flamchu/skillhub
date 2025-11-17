import { useTranslations } from "next-intl";
import { Twitter, Linkedin, Instagram, Heart, Sparkles } from "lucide-react";

interface SocialLinkProps {
	href: string;
	colorScheme: "primary" | "success" | "warning";
	icon: React.ReactNode;
}

function SocialLink({ href, colorScheme, icon }: SocialLinkProps) {
	const colorClasses = {
		primary: "bg-linear-to-br from-primary to-purple hover:scale-110",
		success: "bg-linear-to-br from-success to-info hover:scale-110",
		warning: "bg-linear-to-br from-warning to-pink hover:scale-110",
	};

	return (
		<a
			href={href}
			className={`group w-14 h-14 ${colorClasses[colorScheme]} rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl hover:rotate-6`}
		>
			<div className="w-6 h-6 text-white group-hover:scale-110 transition-transform">{icon}</div>
		</a>
	);
}

export function Footer() {
	const t = useTranslations("footer");

	return (
		<footer className="relative bg-linear-to-br from-primary/5 via-purple/5 to-pink/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-primary/20 dark:border-gray-700 py-24 px-6 mt-32 overflow-hidden">
			{/* Decorative Background */}
			<div className="absolute inset-0 opacity-20">
				<div className="absolute top-10 left-10 w-32 h-32 bg-linear-to-br from-primary to-purple rounded-full blur-2xl" />
				<div className="absolute top-32 right-20 w-40 h-40 bg-linear-to-br from-success to-info rounded-full blur-2xl" />
				<div className="absolute bottom-20 left-1/3 w-36 h-36 bg-linear-to-br from-warning to-pink rounded-full blur-2xl" />
			</div>

			<div className="relative max-w-7xl mx-auto text-center">
				<div className="flex items-center justify-center gap-3 mb-8">
					<div className="w-16 h-16 bg-linear-to-br from-primary via-purple to-pink rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-6 transition-all duration-300">
						<Sparkles className="w-8 h-8 text-white" />
					</div>
					<h3 className="text-4xl font-extrabold bg-linear-to-br from-primary via-purple to-pink text-transparent bg-clip-text">
						SkillHub
					</h3>
				</div>

				<p className="text-gray-600 dark:text-gray-300 mb-16 text-xl max-w-3xl mx-auto leading-relaxed">
					{t("description")}
				</p>

				<div className="flex justify-center gap-8 text-gray-600 dark:text-gray-300 mb-16 flex-wrap">
					<a
						href="#"
						className="group hover:text-primary transition-all duration-300 rounded-2xl px-8 py-4 hover:bg-primary/10 dark:hover:bg-primary/20 hover:scale-105 font-bold text-lg"
					>
						{t("about")}
					</a>
					<a
						href="#"
						className="group hover:text-success transition-all duration-300 rounded-2xl px-8 py-4 hover:bg-success/10 dark:hover:bg-success/20 hover:scale-105 font-bold text-lg"
					>
						{t("contact")}
					</a>
					<a
						href="#"
						className="group hover:text-info transition-all duration-300 rounded-2xl px-8 py-4 hover:bg-info/10 dark:hover:bg-info/20 hover:scale-105 font-bold text-lg"
					>
						Privacy
					</a>
				</div>

				{/* Social Links */}
				<div className="flex justify-center gap-6 mb-16">
					<SocialLink href="#" colorScheme="primary" icon={<Twitter className="w-full h-full" />} />
					<SocialLink href="#" colorScheme="success" icon={<Linkedin className="w-full h-full" />} />
					<SocialLink href="#" colorScheme="warning" icon={<Instagram className="w-full h-full" />} />
				</div>

				<div className="border-t border-primary/20 dark:border-gray-700 pt-12">
					<div className="flex items-center justify-center gap-2 mb-6">
						<p className="text-gray-600 dark:text-gray-300 text-lg">{t("madeWithCare")}</p>
						<Heart className="w-5 h-5 text-red-500 animate-pulse" />
					</div>
					<p className="text-gray-500 dark:text-gray-400 font-semibold">
						© {new Date().getFullYear()} SkillHub. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
