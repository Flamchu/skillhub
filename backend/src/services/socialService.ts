import { prisma } from "../config/database";
import { QuestType, XPSource } from "@prisma/client";

// xp required for each level (exponential growth)
export function getXPForLevel(level: number): number {
	return Math.floor(100 * Math.pow(1.5, level - 1));
}

// calculate level from total xp
export function getLevelFromXP(xp: number): number {
	let level = 1;
	let totalXPNeeded = 0;

	while (totalXPNeeded + getXPForLevel(level) <= xp) {
		totalXPNeeded += getXPForLevel(level);
		level++;
	}

	return level;
}

// calculate progress to next level
export function getProgressToNextLevel(xp: number): { currentLevel: number; xpInCurrentLevel: number; xpNeededForNextLevel: number; progressPercentage: number } {
	const currentLevel = getLevelFromXP(xp);
	let totalXPForPreviousLevels = 0;

	for (let i = 1; i < currentLevel; i++) {
		totalXPForPreviousLevels += getXPForLevel(i);
	}

	const xpInCurrentLevel = xp - totalXPForPreviousLevels;
	const xpNeededForNextLevel = getXPForLevel(currentLevel);
	const progressPercentage = Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100);

	return {
		currentLevel,
		xpInCurrentLevel,
		xpNeededForNextLevel,
		progressPercentage,
	};
}

// award xp to user
export async function awardXP(userId: string, amount: number, source: XPSource, description?: string, metadata?: any) {
	// create xp transaction
	const transaction = await prisma.xPTransaction.create({
		data: {
			userId,
			amount,
			source,
			description,
			metadata,
		},
	});

	// update user's total xp
	const user = await prisma.user.update({
		where: { id: userId },
		data: {
			xp: {
				increment: amount,
			},
		},
	});

	// calculate new level
	const newLevel = getLevelFromXP(user.xp);

	// update level if it changed
	if (newLevel > user.level) {
		await prisma.user.update({
			where: { id: userId },
			data: { level: newLevel },
		});
	}

	return { transaction, newXP: user.xp, newLevel };
}

// update streak counter
export async function updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number; streakBroken: boolean }> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			currentStreak: true,
			longestStreak: true,
			lastActivityDate: true,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
	if (lastActivity) {
		lastActivity.setHours(0, 0, 0, 0);
	}

	let currentStreak = user.currentStreak;
	let longestStreak = user.longestStreak;
	let streakBroken = false;

	// if last activity was today, don't update streak
	if (lastActivity && lastActivity.getTime() === today.getTime()) {
		return { currentStreak, longestStreak, streakBroken: false };
	}

	// if last activity was yesterday, increment streak
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
		currentStreak++;
		if (currentStreak > longestStreak) {
			longestStreak = currentStreak;
		}

		// award streak bonus xp every 7 days
		if (currentStreak % 7 === 0) {
			const bonusXP = 50 * (currentStreak / 7);
			await awardXP(userId, bonusXP, XPSource.STREAK_BONUS, `${currentStreak} day streak bonus!`);
		}
	} else {
		// streak broken
		if (currentStreak > 0) {
			streakBroken = true;
		}
		currentStreak = 1;
	}

	// update user
	await prisma.user.update({
		where: { id: userId },
		data: {
			currentStreak,
			longestStreak,
			lastActivityDate: new Date(),
		},
	});

	return { currentStreak, longestStreak, streakBroken };
}

// check and complete quest
export async function checkQuestProgress(userId: string, questType: QuestType, incrementBy: number = 1): Promise<{ questCompleted: boolean; xpAwarded: number } | null> {
	// find active daily quests of this type
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const quest = await prisma.quest.findFirst({
		where: {
			type: questType,
			isActive: true,
		},
	});

	if (!quest) {
		return null;
	}

	// check if user already completed this quest today
	const existingCompletion = await prisma.questCompletion.findFirst({
		where: {
			userId,
			questId: quest.id,
			completedAt: {
				gte: today,
			},
			isCompleted: true,
		},
	});

	if (existingCompletion) {
		return { questCompleted: false, xpAwarded: 0 };
	}

	// get or create quest completion for today
	const completion = await prisma.questCompletion.upsert({
		where: {
			userId_questId_completedAt: {
				userId,
				questId: quest.id,
				completedAt: today,
			},
		},
		update: {
			progress: {
				increment: incrementBy,
			},
		},
		create: {
			userId,
			questId: quest.id,
			progress: incrementBy,
			completedAt: today,
		},
	});

	// check if quest is now completed
	if (!completion.isCompleted && completion.progress >= quest.targetCount) {
		const updatedCompletion = await prisma.questCompletion.update({
			where: { id: completion.id },
			data: {
				isCompleted: true,
				xpAwarded: quest.xpReward,
			},
		});

		// award xp
		await awardXP(userId, quest.xpReward, XPSource.QUEST_COMPLETION, `Completed quest: ${quest.title}`, { questId: quest.id });

		return { questCompleted: true, xpAwarded: quest.xpReward };
	}

	return { questCompleted: false, xpAwarded: 0 };
}

// get weekly leaderboard
export async function getWeeklyLeaderboard(limit: number = 50) {
	const oneWeekAgo = new Date();
	oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

	// get users with most xp earned in the last week
	const leaderboard = await prisma.xPTransaction.groupBy({
		by: ["userId"],
		where: {
			createdAt: {
				gte: oneWeekAgo,
			},
		},
		_sum: {
			amount: true,
		},
		orderBy: {
			_sum: {
				amount: "desc",
			},
		},
		take: limit,
	});

	// get user details
	const userIds = leaderboard.map((entry) => entry.userId);
	const users = await prisma.user.findMany({
		where: {
			id: {
				in: userIds,
			},
			deletedAt: null,
			socialEnabled: true,
		},
		select: {
			id: true,
			name: true,
			email: true,
			xp: true,
			level: true,
			currentStreak: true,
			regionId: true,
			region: {
				select: {
					id: true,
					name: true,
					code: true,
				},
			},
		},
	}); // combine leaderboard with user details
	const leaderboardWithUsers = leaderboard
		.map((entry, index) => {
			const user = users.find((u) => u.id === entry.userId);
			if (!user) return null;

			return {
				rank: index + 1,
				user: {
					id: user.id,
					name: user.name || "Anonymous",
					xp: user.xp,
					level: user.level,
					currentStreak: user.currentStreak,
					region: user.region,
				},
				weeklyXP: entry._sum.amount || 0,
			};
		})
		.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

	return leaderboardWithUsers;
}

// get user's daily quests
export async function getUserDailyQuests(userId: string) {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// get all active quests
	const quests = await prisma.quest.findMany({
		where: {
			isActive: true,
		},
		orderBy: {
			xpReward: "desc",
		},
	});

	// get user's completions for today
	const completions = await prisma.questCompletion.findMany({
		where: {
			userId,
			completedAt: {
				gte: today,
			},
		},
	});

	// combine quests with completion status
	const questsWithProgress = quests.map((quest) => {
		const completion = completions.find((c) => c.questId === quest.id);

		return {
			id: quest.id,
			title: quest.title,
			description: quest.description,
			type: quest.type,
			xpReward: quest.xpReward,
			targetCount: quest.targetCount,
			progress: completion?.progress || 0,
			isCompleted: completion?.isCompleted || false,
			completedAt: completion?.completedAt,
		};
	});

	return questsWithProgress;
}

// seed initial quests
export async function seedQuests() {
	const quests = [
		{
			title: "Daily Login",
			description: "Log in to SkillHub",
			type: QuestType.DAILY_LOGIN,
			xpReward: 10,
			targetCount: 1,
		},
		{
			title: "Complete a Lesson",
			description: "Complete any lesson from your courses",
			type: QuestType.COMPLETE_LESSON,
			xpReward: 25,
			targetCount: 1,
		},
		{
			title: "Learn 3 Lessons",
			description: "Complete 3 lessons today",
			type: QuestType.COMPLETE_MULTIPLE_LESSONS,
			xpReward: 100,
			targetCount: 3,
		},
		{
			title: "Add a New Skill",
			description: "Add a new skill to your profile",
			type: QuestType.ADD_SKILL,
			xpReward: 30,
			targetCount: 1,
		},
		{
			title: "Verify Your Skills",
			description: "Complete a skill verification test",
			type: QuestType.VERIFY_SKILL,
			xpReward: 75,
			targetCount: 1,
		},
		{
			title: "Bookmark a Course",
			description: "Save a course for later",
			type: QuestType.BOOKMARK_COURSE,
			xpReward: 15,
			targetCount: 1,
		},
		{
			title: "Complete a Course",
			description: "Finish an entire course",
			type: QuestType.COMPLETE_COURSE,
			xpReward: 150,
			targetCount: 1,
		},
	];

	for (const quest of quests) {
		// check if quest with this title already exists
		const existing = await prisma.quest.findFirst({
			where: { title: quest.title },
		});

		if (!existing) {
			await prisma.quest.create({
				data: quest,
			});
		}
	}

	console.log("✅ Seeded quests successfully");
}
