/**
 * client-side utilities for social/gamification features
 * keeps xp calculations on the client to reduce server load
 */

// social profile structure
interface SocialProfile {
	user: {
		id: string;
		name: string | null;
		xp: number;
		level: number;
		currentStreak: number;
		longestStreak: number;
		lastActivityDate: string | null;
		currentLevel: number;
		xpInCurrentLevel: number;
		xpNeededForNextLevel: number;
		progressPercentage: number;
	};
}

// xp required for each level (matches backend logic)
const XP_PER_LEVEL = 100;
const XP_MULTIPLIER = 1.5;

/**
 * calculate level from total xp
 */
export function getLevelFromXP(xp: number): number {
	let level = 1;
	let xpNeeded = XP_PER_LEVEL;

	while (xp >= xpNeeded) {
		xp -= xpNeeded;
		level++;
		xpNeeded = Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
	}

	return level;
}

/**
 * calculate xp progress in current level
 */
export function getProgressToNextLevel(xp: number): {
	currentLevel: number;
	xpInCurrentLevel: number;
	xpNeededForNextLevel: number;
	progressPercentage: number;
} {
	const currentLevel = getLevelFromXP(xp);

	// calculate total xp needed to reach current level
	let totalXPForCurrentLevel = 0;
	for (let i = 1; i < currentLevel; i++) {
		totalXPForCurrentLevel += Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, i - 1));
	}

	// xp earned in current level
	const xpInCurrentLevel = xp - totalXPForCurrentLevel;

	// xp needed for next level
	const xpNeededForNextLevel = Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, currentLevel - 1));

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
 * cache social profile in localStorage
 */
export function cacheSocialProfile(userId: string, profile: SocialProfile): void {
	const cacheKey = `social:profile:${userId}`;
	const cacheData = {
		profile,
		timestamp: Date.now(),
	};
	localStorage.setItem(cacheKey, JSON.stringify(cacheData));
}

/**
 * get cached social profile from localStorage
 * returns null if cache is older than ttl (in seconds)
 */
export function getCachedSocialProfile(userId: string, ttl: number = 60): SocialProfile | null {
	const cacheKey = `social:profile:${userId}`;
	const cached = localStorage.getItem(cacheKey);

	if (!cached) return null;

	try {
		const { profile, timestamp } = JSON.parse(cached);
		const age = (Date.now() - timestamp) / 1000; // age in seconds

		if (age > ttl) {
			// cache expired
			localStorage.removeItem(cacheKey);
			return null;
		}

		return profile;
	} catch {
		return null;
	}
}

/**
 * optimistically update xp in localStorage
 */
export function updateLocalXP(userId: string, xpGained: number): void {
	const cached = getCachedSocialProfile(userId, Infinity); // get regardless of ttl
	if (!cached) return;

	cached.user.xp += xpGained;

	// recalculate level progress
	const progress = getProgressToNextLevel(cached.user.xp);
	cached.user.level = progress.currentLevel;
	cached.user.xpInCurrentLevel = progress.xpInCurrentLevel;
	cached.user.xpNeededForNextLevel = progress.xpNeededForNextLevel;
	cached.user.progressPercentage = progress.progressPercentage;

	cacheSocialProfile(userId, cached);
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
