"use client";

import type { UserProfile } from "@/types";
import { Avatar } from "@/components/ui";
import { useTranslations } from "next-intl";
import { getRoleLabel } from "@/lib/i18n-utils";

interface ProfileHeaderProps {
	user: UserProfile | null;
	className?: string;
}

export function ProfileHeader({ user, className = "" }: ProfileHeaderProps) {
	const t = useTranslations("profile.header");
	const tCommon = useTranslations("common");

	if (!user) {
		return null;
	}

	return (
		<div className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 ${className}`}>
			<div className="shrink-0">
				<Avatar
					src=""
					alt={user.name || t("fallbackName")}
					name={user.name || t("fallbackName")}
					size="xl"
					className="ring-4 ring-primary-100 dark:ring-primary-900 shadow-lg"
				/>
			</div>

			<div className="flex-1 min-w-0">
				<h2 className="text-3xl font-bold text-foreground mb-2">{user.name || t("noName")}</h2>

				{user.headline && <p className="text-foreground-muted text-lg mb-3 font-medium">{user.headline}</p>}

				<div className="flex flex-wrap items-center gap-4 text-sm">
					<span className="text-foreground-subtle flex items-center gap-2">
						<span className="text-lg">📧</span>
						{user.email}
					</span>
					{user.role && (
						<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 text-primary-700 dark:text-primary-300 rounded-sm capitalize font-medium border border-primary-200 dark:border-primary-800">
							<span className="text-sm">👤</span>
							{getRoleLabel(user.role, tCommon)}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
