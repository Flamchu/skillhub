/**
 * client-side utilities for social/gamification features
 * keeps xp calculations on the client to reduce server load
 */

// xp required for each level (matches backend logic)
const XP_PER_LEVEL = 100;
const XP_MULTIPLIER = 1.5;

/**
 * calculate level from total xp (matches backend logic exactly)
 */
export function getLevelFromXP(xp: number): number {
	let level = 1;
	let totalXPNeeded = 0;

	while (totalXPNeeded + getXPForLevel(level) <= xp) {
		totalXPNeeded += getXPForLevel(level);
		level++;
	}

	return level;
}

/**
 * calculate xp progress in current level (matches backend logic exactly)
 */
export function getProgressToNextLevel(xp: number): {
	currentLevel: number;
	xpInCurrentLevel: number;
	xpNeededForNextLevel: number;
	progressPercentage: number;
} {
	const currentLevel = getLevelFromXP(xp);

	// calculate total xp needed to reach current level
	let totalXPForPreviousLevels = 0;
	for (let i = 1; i < currentLevel; i++) {
		totalXPForPreviousLevels += getXPForLevel(i);
	}

	// xp earned in current level
	const xpInCurrentLevel = xp - totalXPForPreviousLevels;

	// xp needed for next level
	const xpNeededForNextLevel = getXPForLevel(currentLevel);

	// percentage progress
	const progressPercentage = Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100);

	return {
		currentLevel,
		xpInCurrentLevel,
		xpNeededForNextLevel,
		progressPercentage,
	};
}

/**
 * calculate total xp needed for a specific level
 */
export function getTotalXPForLevel(level: number): number {
	let totalXP = 0;
	for (let i = 1; i < level; i++) {
		totalXP += Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, i - 1));
	}
	return totalXP;
}

/**
 * get xp required for next level from current level
 */
export function getXPForLevel(level: number): number {
	return Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
}

/**
 * optimistically update xp in localStorage and user data
 * call this after actions that award xp (lesson completion, etc)
 */
export function updateLocalXP(userId: string, xpGained: number): void {
	// update user object in localStorage
	const userStr = localStorage.getItem("user");
	if (!userStr) return;

	try {
		const user = JSON.parse(userStr);
		user.xp = (user.xp || 0) + xpGained;

		// recalculate level
		const progress = getProgressToNextLevel(user.xp);
		user.level = progress.currentLevel;

		// save back to localStorage
		localStorage.setItem("user", JSON.stringify(user));

		// trigger storage event for auth provider to refresh
		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "user",
				newValue: JSON.stringify(user),
				storageArea: localStorage,
			})
		);
	} catch (error) {
		console.warn("Failed to update local XP:", error);
	}
}

/**
 * update streak data in localStorage
 */
export function updateLocalStreak(currentStreak: number, longestStreak: number): void {
	const userStr = localStorage.getItem("user");
	if (!userStr) return;

	try {
		const user = JSON.parse(userStr);
		user.currentStreak = currentStreak;
		user.longestStreak = longestStreak;
		user.lastActivityDate = new Date().toISOString();

		localStorage.setItem("user", JSON.stringify(user));

		// trigger storage event
		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "user",
				newValue: JSON.stringify(user),
				storageArea: localStorage,
			})
		);
	} catch (error) {
		console.warn("Failed to update local streak:", error);
	}
}

/**
 * check if user has social enabled from localStorage
 */
export function isSocialEnabled(): boolean {
	const userStr = localStorage.getItem("user");
	if (!userStr) return false;

	try {
		const user = JSON.parse(userStr);
		return user.socialEnabled === true;
	} catch {
		return false;
	}
}
