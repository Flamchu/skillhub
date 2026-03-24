/**
 * script to fetch and store youtube chapters for all single-video courses
 * run with: pnpm --filter backend exec tsx src/scripts/updateVideoChapters.ts
 */

import { batchUpdateChapters } from "../services/youtubeChaptersService";
import { prisma } from "../config/database";

async function main() {
	console.log("🎬 fetching all single-video courses...\n");

	// find all courses with exactly 1 lesson
	const allCourses = await prisma.course.findMany({
		include: {
			_count: {
				select: { lessons: true },
			},
			lessons: {
				select: {
					id: true,
					providerVideoId: true,
				},
				take: 1,
			},
		},
	});

	const singleVideoCourses = allCourses.filter((c) => c._count.lessons === 1);

	console.log(`📊 found ${singleVideoCourses.length} single-video courses\n`);

	if (singleVideoCourses.length === 0) {
		console.log("✅ no courses to update");
		return;
	}

	// process in batches of 10 to avoid rate limiting
	const batchSize = 10;
	const courseIds = singleVideoCourses.map((c) => c.id);
	let totalUpdated = 0;
	let totalFailed = 0;

	for (let i = 0; i < courseIds.length; i += batchSize) {
		const batch = courseIds.slice(i, i + batchSize);
		const batchNum = Math.floor(i / batchSize) + 1;
		const totalBatches = Math.ceil(courseIds.length / batchSize);

		console.log(`📦 processing batch ${batchNum}/${totalBatches} (${batch.length} courses)...`);

		const result = await batchUpdateChapters(batch);
		totalUpdated += result.updated;
		totalFailed += result.failed;

		console.log(`   ✅ updated: ${result.updated}`);
		console.log(`   ❌ failed: ${result.failed}`);
		console.log(`   ⏭️  skipped: ${batch.length - result.updated - result.failed}\n`);

		// delay between batches to be nice to youtube
		if (i + batchSize < courseIds.length) {
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}

	console.log("\n🎉 batch update complete!");
	console.log(`   total updated: ${totalUpdated}`);
	console.log(`   total failed: ${totalFailed}`);
	console.log(`   total skipped: ${courseIds.length - totalUpdated - totalFailed}`);
}

main()
	.catch((error) => {
		console.error("❌ error updating chapters:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
