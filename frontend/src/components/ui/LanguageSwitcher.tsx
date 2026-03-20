"use client";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales } from "@/i18n";

export function LanguageSwitcher() {
	const router = useRouter();
	const pathname = usePathname();
	const locale = useLocale();
	const t = useTranslations("common.languageSwitcher");

	const switchLocale = (newLocale: string) => {
		// replace the locale in the current pathname
		const segments = pathname.split("/");

		// if pathname starts with a locale (e.g., /en/dashboard), replace it
		if (locales.includes(segments[1] as (typeof locales)[number])) {
			segments[1] = newLocale;
		} else {
			// if no locale in path, add it
			segments.splice(1, 0, newLocale);
		}

		const newPath = segments.join("/");
		router.push(newPath);
	};

	return (
		<div className="relative">
			<select
				value={locale}
				onChange={e => switchLocale(e.target.value)}
				aria-label={t("label")}
				className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none shadow-sm hover:border-primary/50 transition-colors"
			>
				{locales.map(loc => (
					<option key={loc} value={loc}>
						{t(`locales.${loc}`)}
					</option>
				))}
			</select>
		</div>
	);
}
