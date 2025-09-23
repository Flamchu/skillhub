import { prisma } from "../config/database";
import { aiSummaryService } from "../services/aiSummaryService";

/**
 * Utility script to generate AI summaries for existing courses
 * that don't have them yet
 */
async function generateMissingAiSummaries() {
	try {
		console.log("🤖 Starting AI summary generation for existing courses...");

		// find courses without AI summaries that have descriptions
		const coursesWithoutSummaries = await prisma.course.findMany({
			where: {
				aiSummary: null,
				description: {
					not: null,
				},
			},
			select: {
				id: true,
				title: true,
				description: true,
			},
		});

		console.log(`📚 Found ${coursesWithoutSummaries.length} courses without AI summaries`);

		let successCount = 0;
		let failureCount = 0;

		for (const course of coursesWithoutSummaries) {
			try {
				console.log(`📝 Processing: ${course.title}`);

				const aiSummary = await aiSummaryService.generateSummary(course.description!);

				if (aiSummary) {
					await prisma.course.update({
						where: { id: course.id },
						data: { aiSummary },
					});

					console.log(`✅ Generated summary for: ${course.title}`);
					successCount++;
				} else {
					console.log(`⚠️ No summary generated for: ${course.title}`);
					failureCount++;
				}

				// rate limiting - wait between requests to avoid overwhelming the API
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (error) {
				console.error(`❌ Failed to process ${course.title}:`, error);
				failureCount++;

				// continue with next course even if one fails
				continue;
			}
		}

		console.log("\n📊 Summary generation completed:");
		console.log(`✅ Successful: ${successCount}`);
		console.log(`❌ Failed: ${failureCount}`);
		console.log(`📚 Total processed: ${coursesWithoutSummaries.length}`);
	} catch (error) {
		console.error("💥 Fatal error in summary generation script:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// run script if called directly
if (require.main === module) {
	generateMissingAiSummaries()
		.then(() => {
			console.log("🎉 AI summary generation script completed successfully!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("💥 Script failed:", error);
			process.exit(1);
		});
}

export { generateMissingAiSummaries };
