import { PrismaClient, Role } from "@prisma/client";
import { supabase } from "./config/supabase";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Starting database seeding...");

	// Create admin user
	const adminEmail = "root@flamchustudios.com"; // Changed to a more appropriate email
	const adminPassword = "VerySecurePassword$1"; // Temporary password - user should reset

	// Check if admin already exists in our database
	const existingAdmin = await prisma.user.findFirst({
		where: {
			OR: [{ email: adminEmail }, { role: Role.ADMIN }],
		},
	});

	if (existingAdmin) {
		console.log("👤 Admin user already exists");
		console.log("   Email:", existingAdmin.email);
		console.log("   Name:", existingAdmin.name);
		console.log("   Role:", existingAdmin.role);
	} else {
		try {
			// Create admin user in Supabase Auth
			const { data: supabaseUser, error } = await supabase.auth.admin.createUser({
				email: adminEmail,
				password: adminPassword,
				email_confirm: true,
				user_metadata: {
					name: "System Administrator",
					role: "ADMIN",
					created_via: "seed_script",
				},
			});

			if (error) {
				// Check if user already exists in Supabase
				if (error.message.includes("already registered") || error.message.includes("already been registered")) {
					console.log("👤 Admin user already exists in Supabase");
					console.log("   Email:", adminEmail);

					// Check if local profile exists
					const existingProfile = await prisma.user.findUnique({
						where: { email: adminEmail },
					});

					if (!existingProfile) {
						console.log("🔍 Local admin profile not found, creating it...");

						// Get the existing Supabase user
						const {
							data: { users },
							error: getUserError,
						} = await supabase.auth.admin.listUsers();
						const existingSupabaseUser = users.find((user) => user.email === adminEmail);

						if (getUserError || !existingSupabaseUser) {
							console.log("⚠️  Could not retrieve existing Supabase user");
						} else {
							// Create local profile for existing Supabase user
							const adminUser = await prisma.user.create({
								data: {
									supabaseId: existingSupabaseUser.id,
									email: adminEmail,
									name: "System Administrator",
									headline: "SkillHub Administrator",
									bio: "System administrator account for managing SkillHub platform",
									role: Role.ADMIN,
								},
							});

							console.log("✅ Local admin profile created:");
							console.log("   Email:", adminUser.email);
							console.log("   Name:", adminUser.name);
							console.log("   Role:", adminUser.role);
							console.log("   Database ID:", adminUser.id);
							console.log("   Supabase ID:", adminUser.supabaseId);
						}
					} else {
						console.log("✅ Local admin profile already exists");
						console.log("   Email:", existingProfile.email);
						console.log("   Name:", existingProfile.name);
						console.log("   Role:", existingProfile.role);
					}
				} else {
					throw new Error(`Failed to create admin in Supabase: ${error.message}`);
				}
			} else if (supabaseUser.user) {
				// Create admin profile in our database
				const adminUser = await prisma.user.create({
					data: {
						supabaseId: supabaseUser.user.id,
						email: adminEmail,
						name: "System Administrator",
						headline: "SkillHub Administrator",
						bio: "System administrator account for managing SkillHub platform",
						role: Role.ADMIN,
					},
				});

				console.log("✅ Admin user created successfully:");
				console.log("   Email:", adminUser.email);
				console.log("   Name:", adminUser.name);
				console.log("   Role:", adminUser.role);
				console.log("   Database ID:", adminUser.id);
				console.log("   Supabase ID:", adminUser.supabaseId);
				console.log("");
				console.log("🔑 Login credentials:");
				console.log("   Email:", adminEmail);
				console.log("   Password:", adminPassword);
				console.log("");
				console.log("⚠️  IMPORTANT: Change the default password after first login!");
				console.log("💡 Use the /api/auth/change-password endpoint or Supabase dashboard");
			} else {
				console.log("⚠️  Admin user creation returned no data");
			}
		} catch (error: any) {
			console.error("❌ Failed to create admin user:", error.message);
			// Don't throw - continue with seeding
			console.log("   Continuing with data seeding...");
		}
	}

	// Create some sample regions
	const regions = [
		{ name: "North America", code: "NA" },
		{ name: "Europe", code: "EU" },
		{ name: "Asia Pacific", code: "APAC" },
		{ name: "Latin America", code: "LATAM" },
		{ name: "Africa", code: "AF" },
	];

	console.log("🌍 Creating sample regions...");
	for (const regionData of regions) {
		const existingRegion = await prisma.region.findUnique({
			where: { name: regionData.name },
		});

		if (!existingRegion) {
			await prisma.region.create({
				data: regionData,
			});
			console.log(`   ✅ Created region: ${regionData.name} (${regionData.code})`);
		} else {
			console.log(`   ⏭️  Region already exists: ${regionData.name}`);
		}
	}

	// Create sample skills hierarchy
	console.log("🎯 Creating sample skills...");

	const skillsData = [
		// Programming
		{
			name: "Programming",
			slug: "programming",
			description: "Software development and programming skills",
			children: [
				{
					name: "JavaScript",
					slug: "javascript",
					description: "JavaScript programming language",
				},
				{
					name: "Python",
					slug: "python",
					description: "Python programming language",
				},
				{
					name: "TypeScript",
					slug: "typescript",
					description: "TypeScript programming language",
				},
				{
					name: "React",
					slug: "react",
					description: "React frontend framework",
				},
				{
					name: "Node.js",
					slug: "nodejs",
					description: "Node.js runtime environment",
				},
				{
					name: "Java",
					slug: "java",
					description: "Java programming language",
				},
				{
					name: "C#",
					slug: "csharp",
					description: "C# programming language",
				},
				{
					name: "PHP",
					slug: "php",
					description: "PHP server-side scripting language",
				},
			],
		},
		// Design
		{
			name: "Design",
			slug: "design",
			description: "Design and user experience skills",
			children: [
				{
					name: "UI Design",
					slug: "ui-design",
					description: "User interface design",
				},
				{
					name: "UX Design",
					slug: "ux-design",
					description: "User experience design",
				},
				{
					name: "Figma",
					slug: "figma",
					description: "Figma design tool",
				},
				{
					name: "Adobe Photoshop",
					slug: "photoshop",
					description: "Adobe Photoshop image editing software",
				},
				{
					name: "Adobe Illustrator",
					slug: "illustrator",
					description: "Adobe Illustrator vector graphics software",
				},
			],
		},
		// Data Science
		{
			name: "Data Science",
			slug: "data-science",
			description: "Data analysis and machine learning",
			children: [
				{
					name: "Machine Learning",
					slug: "machine-learning",
					description: "Machine learning algorithms and techniques",
				},
				{
					name: "Data Analysis",
					slug: "data-analysis",
					description: "Data analysis and visualization",
				},
				{
					name: "SQL",
					slug: "sql",
					description: "Structured Query Language",
				},
				{
					name: "Python (Data Science)",
					slug: "python-data-science",
					description: "Python for data science and analytics",
				},
				{
					name: "R Programming",
					slug: "r-programming",
					description: "R statistical programming language",
				},
			],
		},
		// Marketing
		{
			name: "Marketing",
			slug: "marketing",
			description: "Digital marketing and growth skills",
			children: [
				{
					name: "SEO",
					slug: "seo",
					description: "Search Engine Optimization",
				},
				{
					name: "Social Media Marketing",
					slug: "social-media-marketing",
					description: "Social media strategy and marketing",
				},
				{
					name: "Content Marketing",
					slug: "content-marketing",
					description: "Content creation and marketing strategies",
				},
				{
					name: "Google Analytics",
					slug: "google-analytics",
					description: "Web analytics and data analysis",
				},
			],
		},
		// Project Management
		{
			name: "Project Management",
			slug: "project-management",
			description: "Project management and organizational skills",
			children: [
				{
					name: "Agile/Scrum",
					slug: "agile-scrum",
					description: "Agile project management methodologies",
				},
				{
					name: "Jira",
					slug: "jira",
					description: "Atlassian Jira project management tool",
				},
				{
					name: "Leadership",
					slug: "leadership",
					description: "Team leadership and management skills",
				},
			],
		},
	];

	for (const skillData of skillsData) {
		const existingSkill = await prisma.skill.findUnique({
			where: { slug: skillData.slug },
		});

		let parentSkill;
		if (!existingSkill) {
			parentSkill = await prisma.skill.create({
				data: {
					name: skillData.name,
					slug: skillData.slug,
					description: skillData.description,
				},
			});
			console.log(`   ✅ Created parent skill: ${skillData.name}`);
		} else {
			parentSkill = existingSkill;
			console.log(`   ⏭️  Parent skill already exists: ${skillData.name}`);
		}

		// Create child skills
		for (const childData of skillData.children) {
			const existingChild = await prisma.skill.findUnique({
				where: { slug: childData.slug },
			});

			if (!existingChild) {
				await prisma.skill.create({
					data: {
						name: childData.name,
						slug: childData.slug,
						description: childData.description,
						parentId: parentSkill.id,
					},
				});
				console.log(`     ✅ Created child skill: ${childData.name}`);
			} else {
				console.log(`     ⏭️  Child skill already exists: ${childData.name}`);
			}
		}
	}

	console.log("");
	console.log("🎉 Database seeding completed successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Error during seeding:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
