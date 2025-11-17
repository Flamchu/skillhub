import { useTranslations } from "next-intl";

interface SocialLinkProps {
	href: string;
	colorScheme: "primary" | "success" | "warning";
	children: React.ReactNode;
}

function SocialLink({ href, colorScheme, children }: SocialLinkProps) {
	const colorClasses = {
		primary: "bg-linear-to-br from-primary to-purple",
		success: "bg-linear-to-br from-success to-info",
		warning: "bg-linear-to-br from-warning to-pink",
	};

	return (
		<a
			href={href}
			className={`group w-14 h-14 ${colorClasses[colorScheme]} rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl`}
		>
			<div className="w-6 h-6 text-white group-hover:scale-110 transition-transform">{children}</div>
		</a>
	);
}

export function Footer() {
	const t = useTranslations("footer");

	return (
		<footer className="relative bg-linear-to-br from-primary/5 via-purple/5 to-pink/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-primary/20 dark:border-gray-700 py-20 px-6 mt-32 overflow-hidden">
			{/* Decorative Background */}
			<div className="absolute inset-0 opacity-20">
				<div className="absolute top-10 left-10 w-20 h-20 bg-linear-to-br from-primary to-purple rounded-full blur-xl" />
				<div className="absolute top-32 right-20 w-32 h-32 bg-linear-to-br from-success to-info rounded-full blur-xl" />
				<div className="absolute bottom-20 left-1/3 w-24 h-24 bg-linear-to-br from-warning to-pink rounded-full blur-xl" />
			</div>

			<div className="relative max-w-6xl mx-auto text-center">
				<div className="flex items-center justify-center space-x-3 mb-6">
					<div className="w-12 h-12 bg-linear-to-br from-primary to-purple rounded-2xl flex items-center justify-center shadow-lg">
						<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="m12 14 6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
							/>
						</svg>
					</div>
					<h3 className="text-3xl font-bold text-primary">SkillHub</h3>
				</div>

				<p className="text-gray-600 dark:text-gray-300 mb-12 text-xl max-w-2xl mx-auto">{t("description")}</p>

				<div className="flex justify-center gap-8 text-gray-600 dark:text-gray-300 mb-12">
					<a
						href="#"
						className="group hover:text-primary transition-all duration-300 rounded-xl px-6 py-3 hover:bg-primary/10 dark:hover:bg-primary/20 hover:scale-105 transform font-medium"
					>
						{t("about")}
					</a>
					<a
						href="#"
						className="group hover:text-success transition-all duration-300 rounded-xl px-6 py-3 hover:bg-success/10 dark:hover:bg-success/20 hover:scale-105 transform font-medium"
					>
						{t("contact")}
					</a>
					<a
						href="#"
						className="group hover:text-info transition-all duration-300 rounded-xl px-6 py-3 hover:bg-info/10 dark:hover:bg-info/20 hover:scale-105 transform font-medium"
					>
						Privacy
					</a>
				</div>

				{/* Social Links */}
				<div className="flex justify-center space-x-6 mb-12">
					<SocialLink href="#" colorScheme="primary">
						<svg fill="currentColor" viewBox="0 0 24 24">
							<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.611 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
						</svg>
					</SocialLink>

					<SocialLink href="#" colorScheme="success">
						<svg fill="currentColor" viewBox="0 0 24 24">
							<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
						</svg>
					</SocialLink>

					<SocialLink href="#" colorScheme="warning">
						<svg fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
						</svg>
					</SocialLink>
				</div>

				<div className="border-t border-primary/20 dark:border-gray-700 pt-10">
					<div className="flex items-center justify-center space-x-2 mb-4">
						<p className="text-gray-600 dark:text-gray-300 text-lg">{t("madeWithCare")}</p>
					</div>
					<p className="text-gray-600 dark:text-gray-300">{t("copyright")}</p>
				</div>
			</div>
		</footer>
	);
}
