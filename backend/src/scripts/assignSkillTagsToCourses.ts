import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function assignSkillTagsToCourses() {
	console.log("Starting to assign skill tags to courses...");

	try {
		// get courses with skills
		const courses = await prisma.course.findMany({
			include: {
				skills: {
					include: {
						skill: {
							select: {
								id: true,
								name: true,
								category: true,
								tags: {
									include: {
										tag: {
											select: {
												name: true,
											},
										},
									},
								},
							},
						},
					},
				},
				tags: {
					include: {
						tag: true,
					},
				},
			},
		});

		console.log(`Found ${courses.length} courses to process`);

		let updatedCount = 0;
		let createdTagsCount = 0;

		for (const course of courses) {
			// collect skill tags
			const skillTags = new Set<string>();
			const skillCategories = new Set<string>();

			course.skills.forEach((courseSkill) => {
				const skill = courseSkill.skill;

				// add skill tags
				skill.tags.forEach((skillTag) => skillTags.add(skillTag.tag.name));

				// Add skill category as a tag
				if (skill.category) {
					skillCategories.add(skill.category.toLowerCase().replace(/\s+/g, "-"));
				}
			}); // Combine skill tags and categories
			const allTags = [...Array.from(skillTags), ...Array.from(skillCategories)];

			if (allTags.length === 0) {
				continue; // Skip courses with no skill tags
			}

			// get existing tags
			const existingTagNames = new Set(course.tags.map((ct) => ct.tag.name));

			// find new tags
			const newTags = allTags.filter((tag) => !existingTagNames.has(tag));

			if (newTags.length === 0) {
				continue; // No new tags to add
			}

			// create missing tags
			for (const tagName of newTags) {
				try {
					await prisma.tag.upsert({
						where: { name: tagName },
						update: {},
						create: { name: tagName },
					});
				} catch (error) {
					// Tag might already exist, continue
				}
			}

			// Get all tags (existing + new)
			const tagsToAssign = await prisma.tag.findMany({
				where: {
					name: {
						in: newTags,
					},
				},
			});

			// Create course-tag associations
			for (const tag of tagsToAssign) {
				try {
					await prisma.courseTag.create({
						data: {
							courseId: course.id,
							tagId: tag.id,
						},
					});
					createdTagsCount++;
				} catch (error) {
					// Association might already exist, continue
				}
			}

			updatedCount++;
			console.log(`✓ Updated course "${course.title}" with ${tagsToAssign.length} new tags: ${tagsToAssign.map((t) => t.name).join(", ")}`);
		}

		console.log(`\n✅ Course tagging completed!`);
		console.log(`📊 Summary:`);
		console.log(`  - Updated ${updatedCount} courses`);
		console.log(`  - Created ${createdTagsCount} course-tag associations`);

		// Show tag statistics
		const tagStats = await prisma.tag.findMany({
			include: {
				_count: {
					select: {
						courses: true,
					},
				},
			},
			orderBy: {
				courses: {
					_count: "desc",
				},
			},
			take: 20,
		});

		console.log(`\n🏷️ Top 20 course tags:`);
		tagStats.forEach((tag) => {
			console.log(`  ${tag.name}: ${tag._count.courses} courses`);
		});
	} catch (error) {
		console.error("❌ Failed to assign skill tags to courses:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the script
if (require.main === module) {
	assignSkillTagsToCourses().catch(console.error);
}

export { assignSkillTagsToCourses };
