type TranslateFn = (key: string, values?: Record<string, string | number | Date>) => string;

export function formatDateByLocale(
	date: Date | string,
	locale: string,
	options?: Intl.DateTimeFormatOptions
): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;

	return dateObj.toLocaleDateString(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
		...options,
	});
}

export function formatRelativeTime(date: Date | string, locale: string, t: TranslateFn): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	const diffInMs = dateObj.getTime() - Date.now();
	const absDiffInMs = Math.abs(diffInMs);

	if (absDiffInMs < 60_000) {
		return t("time.justNow");
	}

	const minutes = Math.round(diffInMs / 60_000);
	if (Math.abs(minutes) < 60) {
		return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(minutes, "minute");
	}

	const hours = Math.round(diffInMs / 3_600_000);
	if (Math.abs(hours) < 24) {
		return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(hours, "hour");
	}

	const days = Math.round(diffInMs / 86_400_000);
	if (Math.abs(days) < 7) {
		return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day");
	}

	return formatDateByLocale(dateObj, locale);
}

export function formatMinutesDuration(totalMinutes: number, t: TranslateFn): string {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	const parts: string[] = [];

	if (hours > 0) {
		parts.push(`${hours} ${t("units.hourShort")}`);
	}

	if (minutes > 0 || hours === 0) {
		parts.push(`${minutes} ${t("units.minuteShort")}`);
	}

	return parts.join(" ");
}

export function formatHourCount(totalMinutes: number, t: TranslateFn): string {
	return `${Math.max(1, Math.round(totalMinutes / 60))} ${t("units.hourShort")}`;
}

export function getRoleLabel(role: string, t: TranslateFn): string {
	switch (role) {
		case "ADMIN":
			return t("roles.admin");
		case "INSTRUCTOR":
			return t("roles.instructor");
		case "USER":
			return t("roles.user");
		default:
			return role;
	}
}

export function getMemberRoleLabel(role: string, t: TranslateFn): string {
	switch (role) {
		case "ADMIN":
			return t("roles.admin");
		case "INSTRUCTOR":
			return t("roles.instructor");
		case "USER":
			return t("roles.member");
		default:
			return role;
	}
}

export function getCourseSourceLabel(source: string, t: TranslateFn): string {
	switch (source) {
		case "INTERNAL":
			return t("sources.internal");
		case "YOUTUBE":
			return t("sources.youtube");
		case "UDEMY":
			return t("sources.udemy");
		case "OTHER":
			return t("sources.other");
		default:
			return source;
	}
}

export function getDifficultyLabel(level: string, t: TranslateFn): string {
	switch (level) {
		case "BEGINNER":
			return t("difficulties.beginner");
		case "INTERMEDIATE":
			return t("difficulties.intermediate");
		case "ADVANCED":
			return t("difficulties.advanced");
		default:
			return level;
	}
}

export function getProficiencyLabel(level: string, t: TranslateFn): string {
	switch (level) {
		case "NONE":
			return t("proficiency.none");
		case "BASIC":
			return t("proficiency.basic");
		case "INTERMEDIATE":
			return t("proficiency.intermediate");
		case "ADVANCED":
			return t("proficiency.advanced");
		case "EXPERT":
			return t("proficiency.expert");
		default:
			return level;
	}
}

export function getXpSourceLabel(source: string, t: TranslateFn): string {
	switch (source) {
		case "QUEST_COMPLETION":
			return t("sources.questCompletion");
		case "COURSE_COMPLETION":
			return t("sources.courseCompletion");
		case "LESSON_COMPLETION":
			return t("sources.lessonCompletion");
		case "SKILL_VERIFICATION":
			return t("sources.skillVerification");
		case "DAILY_LOGIN":
			return t("sources.dailyLogin");
		case "STREAK_BONUS":
			return t("sources.streakBonus");
		default:
			return source;
	}
}

export function getOpenGraphLocale(locale: string): string {
	return locale === "cs" ? "cs_CZ" : "en_US";
}
