"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting database seeding...");
    // Create admin user
    const adminEmail = "root@flamchustudios.com";
    const adminPassword = "verysecurepassword$1"; // Change this to a secure password
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (existingAdmin) {
        console.log("👤 Admin user already exists:", adminEmail);
        return;
    }
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcryptjs_1.default.hash(adminPassword, saltRounds);
    // Create admin user
    const adminUser = await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            name: "System Administrator",
            headline: "SkillHub Administrator",
            bio: "System administrator account for managing SkillHub platform",
            role: client_1.Role.ADMIN,
        },
    });
    console.log("✅ Admin user created successfully:");
    console.log("   Email:", adminUser.email);
    console.log("   Name:", adminUser.name);
    console.log("   Role:", adminUser.role);
    console.log("   ID:", adminUser.id);
    console.log("");
    console.log("🔑 Login credentials:");
    console.log("   Email:", adminEmail);
    console.log("   Password:", adminPassword);
    console.log("");
    console.log("⚠️  IMPORTANT: Change the default password after first login!");
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
        }
        else {
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
        }
        else {
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
            }
            else {
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
