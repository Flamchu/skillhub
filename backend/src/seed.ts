import { PrismaClient, Role } from "@prisma/client";
import { supabase } from "./config/supabase";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Starting database seeding...");

	// create admin user
	const adminEmail = "root@flamchustudios.com"; // admin email for platform
	const adminPassword = "VerySecurePassword$1"; // temporary password - reset after first login

	// check if admin already exists in database
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
			// create admin user in supabase auth
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
				// check if user already exists in supabase
				if (error.message.includes("already registered") || error.message.includes("already been registered")) {
					console.log("👤 Admin user already exists in Supabase");
					console.log("   Email:", adminEmail);

					// check if local profile exists
					const existingProfile = await prisma.user.findUnique({
						where: { email: adminEmail },
					});

					if (!existingProfile) {
						console.log("🔍 Local admin profile not found, creating it...");

						// get existing supabase user
						const {
							data: { users },
							error: getUserError,
						} = await supabase.auth.admin.listUsers();
						const existingSupabaseUser = users.find((user) => user.email === adminEmail);

						if (getUserError || !existingSupabaseUser) {
							console.log("⚠️  Could not retrieve existing Supabase user");
						} else {
							// create local profile for existing supabase user
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
				// create admin profile in database
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
			// don't throw - continue with seeding
			console.log("   Continuing with data seeding...");
		}
	}

	// create sample regions
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

	// create comprehensive IT/Computer Science skills hierarchy
	console.log("🎯 Creating comprehensive IT/Computer Science skills database...");

	const skillsData = [
		// Frontend Development
		{
			name: "Frontend Development",
			slug: "frontend-development",
			description: "Client-side web development technologies and frameworks",
			children: [
				{ name: "HTML", slug: "html", description: "HyperText Markup Language for web structure" },
				{ name: "CSS", slug: "css", description: "Cascading Style Sheets for web styling" },
				{ name: "JavaScript", slug: "javascript", description: "Programming language for interactive web applications" },
				{ name: "TypeScript", slug: "typescript", description: "Strongly typed programming language that builds on JavaScript" },
				{ name: "React", slug: "react", description: "JavaScript library for building user interfaces" },
				{ name: "Vue.js", slug: "vuejs", description: "Progressive JavaScript framework for building UIs" },
				{ name: "Angular", slug: "angular", description: "Platform for building web applications with TypeScript" },
				{ name: "Svelte", slug: "svelte", description: "Compiler that generates vanilla JavaScript" },
				{ name: "Next.js", slug: "nextjs", description: "React framework for production applications" },
				{ name: "Nuxt.js", slug: "nuxtjs", description: "Vue.js framework for creating universal applications" },
				{ name: "Gatsby", slug: "gatsby", description: "Static site generator for React" },
				{ name: "Astro", slug: "astro", description: "Modern static site builder" },
				{ name: "Solid.js", slug: "solidjs", description: "Reactive JavaScript library for building user interfaces" },
				{ name: "Alpine.js", slug: "alpinejs", description: "Lightweight JavaScript framework" },
				{ name: "jQuery", slug: "jquery", description: "JavaScript library for DOM manipulation" },
				{ name: "Bootstrap", slug: "bootstrap", description: "CSS framework for responsive design" },
				{ name: "Tailwind CSS", slug: "tailwindcss", description: "Utility-first CSS framework" },
				{ name: "Sass", slug: "sass", description: "CSS preprocessor with variables and mixins" },
				{ name: "Webpack", slug: "webpack", description: "Module bundler for JavaScript applications" },
				{ name: "Vite", slug: "vite", description: "Fast build tool for modern web projects" },
				{ name: "Parcel", slug: "parcel", description: "Web application bundler with zero configuration" },
			],
		},
		// Backend Development
		{
			name: "Backend Development",
			slug: "backend-development",
			description: "Server-side development technologies and frameworks",
			children: [
				{ name: "Node.js", slug: "nodejs", description: "JavaScript runtime for server-side development" },
				{ name: "Express.js", slug: "expressjs", description: "Web framework for Node.js" },
				{ name: "NestJS", slug: "nestjs", description: "Progressive Node.js framework for scalable server-side applications" },
				{ name: "Fastify", slug: "fastify", description: "Fast and low overhead web framework for Node.js" },
				{ name: "Deno", slug: "deno", description: "Secure runtime for JavaScript and TypeScript" },
				{ name: "Bun", slug: "bun", description: "Fast JavaScript runtime and toolkit" },
				{ name: "Python", slug: "python", description: "High-level programming language" },
				{ name: "Django", slug: "django", description: "High-level Python web framework" },
				{ name: "Flask", slug: "flask", description: "Lightweight Python web framework" },
				{ name: "FastAPI", slug: "fastapi", description: "Modern Python web framework for building APIs" },
				{ name: "Java", slug: "java", description: "Object-oriented programming language" },
				{ name: "Spring Boot", slug: "spring-boot", description: "Java framework for creating stand-alone applications" },
				{ name: "Spring Framework", slug: "spring-framework", description: "Comprehensive Java framework" },
				{ name: "C#", slug: "csharp", description: "Programming language developed by Microsoft" },
				{ name: "ASP.NET Core", slug: "aspnet-core", description: "Cross-platform framework for building web apps" },
				{ name: "ASP.NET", slug: "aspnet", description: "Web framework for building web apps and services with .NET" },
				{ name: ".NET", slug: "dotnet", description: "Developer platform for building applications" },
				{ name: "PHP", slug: "php", description: "Server-side scripting language" },
				{ name: "Laravel", slug: "laravel", description: "PHP web application framework" },
				{ name: "Symfony", slug: "symfony", description: "PHP framework for web applications" },
				{ name: "CodeIgniter", slug: "codeigniter", description: "PHP web application framework" },
				{ name: "Ruby", slug: "ruby", description: "Dynamic programming language" },
				{ name: "Ruby on Rails", slug: "ruby-on-rails", description: "Web application framework written in Ruby" },
				{ name: "Go", slug: "go", description: "Programming language developed by Google" },
				{ name: "Gin", slug: "gin", description: "HTTP web framework for Go" },
				{ name: "Rust", slug: "rust", description: "Systems programming language focused on safety and performance" },
				{ name: "Actix Web", slug: "actix-web", description: "Web framework for Rust" },
				{ name: "Kotlin", slug: "kotlin", description: "Modern programming language that runs on the JVM" },
				{ name: "Scala", slug: "scala", description: "Programming language that combines object-oriented and functional programming" },
				{ name: "Elixir", slug: "elixir", description: "Dynamic, functional programming language" },
				{ name: "Phoenix", slug: "phoenix", description: "Web development framework written in Elixir" },
				{ name: "Erlang", slug: "erlang", description: "Programming language designed for distributed systems" },
			],
		},
		// Mobile Development
		{
			name: "Mobile Development",
			slug: "mobile-development",
			description: "Development of mobile applications for various platforms",
			children: [
				{ name: "React Native", slug: "react-native", description: "Framework for building native mobile apps using React" },
				{ name: "Flutter", slug: "flutter", description: "Google's UI toolkit for building natively compiled applications" },
				{ name: "Dart", slug: "dart", description: "Programming language developed by Google for Flutter" },
				{ name: "Swift", slug: "swift", description: "Programming language for iOS and macOS development" },
				{ name: "SwiftUI", slug: "swiftui", description: "User interface toolkit for Swift" },
				{ name: "Objective-C", slug: "objective-c", description: "Programming language for Apple platforms" },
				{ name: "Kotlin Android", slug: "kotlin-android", description: "Modern programming language for Android development" },
				{ name: "Java Android", slug: "java-android", description: "Java for Android application development" },
				{ name: "Xamarin", slug: "xamarin", description: "Microsoft platform for building native mobile apps" },
				{ name: "Ionic", slug: "ionic", description: "Open source mobile UI toolkit" },
				{ name: "Cordova", slug: "cordova", description: "Mobile application development framework" },
				{ name: "Capacitor", slug: "capacitor", description: "Cross-platform native runtime for web apps" },
				{ name: "Expo", slug: "expo", description: "Platform for universal React applications" },
			],
		},
		// Database Technologies
		{
			name: "Database Technologies",
			slug: "database-technologies",
			description: "Database management systems and data storage solutions",
			children: [
				{ name: "SQL", slug: "sql", description: "Structured Query Language for relational databases" },
				{ name: "PostgreSQL", slug: "postgresql", description: "Advanced open source relational database" },
				{ name: "MySQL", slug: "mysql", description: "Popular open source relational database" },
				{ name: "SQLite", slug: "sqlite", description: "Lightweight embedded relational database" },
				{ name: "Microsoft SQL Server", slug: "mssql", description: "Relational database management system by Microsoft" },
				{ name: "Oracle Database", slug: "oracle", description: "Multi-model database management system" },
				{ name: "MariaDB", slug: "mariadb", description: "Open source relational database" },
				{ name: "MongoDB", slug: "mongodb", description: "Document-oriented NoSQL database" },
				{ name: "Redis", slug: "redis", description: "In-memory data structure store" },
				{ name: "Elasticsearch", slug: "elasticsearch", description: "Search and analytics engine" },
				{ name: "Cassandra", slug: "cassandra", description: "Distributed NoSQL database" },
				{ name: "Neo4j", slug: "neo4j", description: "Graph database management system" },
				{ name: "DynamoDB", slug: "dynamodb", description: "NoSQL database service by Amazon Web Services" },
				{ name: "CouchDB", slug: "couchdb", description: "Document-oriented NoSQL database" },
				{ name: "InfluxDB", slug: "influxdb", description: "Time series database" },
				{ name: "Firebase Firestore", slug: "firebase-firestore", description: "NoSQL document database by Google" },
				{ name: "Supabase", slug: "supabase", description: "Open source Firebase alternative" },
				{ name: "Prisma", slug: "prisma", description: "Database toolkit and ORM" },
				{ name: "Sequelize", slug: "sequelize", description: "Promise-based Node.js ORM" },
				{ name: "TypeORM", slug: "typeorm", description: "ORM for TypeScript and JavaScript" },
				{ name: "Mongoose", slug: "mongoose", description: "MongoDB object modeling for Node.js" },
			],
		},
		// DevOps & Cloud
		{
			name: "DevOps & Cloud",
			slug: "devops-cloud",
			description: "Development operations, deployment, and cloud technologies",
			children: [
				{ name: "Docker", slug: "docker", description: "Platform for containerized application deployment" },
				{ name: "Kubernetes", slug: "kubernetes", description: "Container orchestration platform" },
				{ name: "AWS", slug: "aws", description: "Amazon Web Services cloud platform" },
				{ name: "Microsoft Azure", slug: "azure", description: "Cloud computing service by Microsoft" },
				{ name: "Google Cloud", slug: "gcp", description: "Cloud computing services by Google" },
				{ name: "Terraform", slug: "terraform", description: "Infrastructure as code software tool" },
				{ name: "Ansible", slug: "ansible", description: "IT automation platform" },
				{ name: "Jenkins", slug: "jenkins", description: "Open source automation server" },
				{ name: "GitLab CI/CD", slug: "gitlab-cicd", description: "Continuous integration and deployment" },
				{ name: "GitHub Actions", slug: "github-actions", description: "CI/CD platform integrated with GitHub" },
				{ name: "CircleCI", slug: "circleci", description: "Continuous integration and deployment platform" },
				{ name: "Nginx", slug: "nginx", description: "Web server and reverse proxy server" },
				{ name: "Apache", slug: "apache", description: "HTTP server software" },
				{ name: "Linux", slug: "linux", description: "Open source operating system" },
				{ name: "Ubuntu", slug: "ubuntu", description: "Debian-based Linux distribution" },
				{ name: "CentOS", slug: "centos", description: "Community-supported Linux distribution" },
				{ name: "Bash", slug: "bash", description: "Unix shell and command language" },
				{ name: "PowerShell", slug: "powershell", description: "Task automation and scripting framework" },
				{ name: "Vagrant", slug: "vagrant", description: "Tool for building and managing virtualized development environments" },
				{ name: "Helm", slug: "helm", description: "Package manager for Kubernetes" },
				{ name: "Prometheus", slug: "prometheus", description: "Monitoring and alerting toolkit" },
				{ name: "Grafana", slug: "grafana", description: "Analytics and interactive visualization platform" },
			],
		},
		// Data Science & AI
		{
			name: "Data Science & AI",
			slug: "data-science-ai",
			description: "Data analysis, machine learning, and artificial intelligence",
			children: [
				{ name: "Machine Learning", slug: "machine-learning", description: "Algorithms that learn from data" },
				{ name: "Deep Learning", slug: "deep-learning", description: "Machine learning using neural networks" },
				{ name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Simulation of human intelligence in machines" },
				{ name: "TensorFlow", slug: "tensorflow", description: "Open source machine learning framework" },
				{ name: "PyTorch", slug: "pytorch", description: "Machine learning library for Python" },
				{ name: "Scikit-learn", slug: "scikit-learn", description: "Machine learning library for Python" },
				{ name: "Pandas", slug: "pandas", description: "Data manipulation and analysis library for Python" },
				{ name: "NumPy", slug: "numpy", description: "Fundamental package for scientific computing with Python" },
				{ name: "Matplotlib", slug: "matplotlib", description: "Plotting library for Python" },
				{ name: "Seaborn", slug: "seaborn", description: "Statistical data visualization library" },
				{ name: "Jupyter", slug: "jupyter", description: "Interactive computing environment" },
				{ name: "R", slug: "r", description: "Programming language for statistical computing" },
				{ name: "Apache Spark", slug: "apache-spark", description: "Unified analytics engine for big data processing" },
				{ name: "Hadoop", slug: "hadoop", description: "Framework for distributed storage and processing" },
				{ name: "Kafka", slug: "kafka", description: "Distributed event streaming platform" },
				{ name: "Power BI", slug: "power-bi", description: "Business analytics service by Microsoft" },
				{ name: "Tableau", slug: "tableau", description: "Data visualization and business intelligence platform" },
				{ name: "OpenCV", slug: "opencv", description: "Computer vision and machine learning software library" },
			],
		},
		// Cybersecurity
		{
			name: "Cybersecurity",
			slug: "cybersecurity",
			description: "Information security and cybersecurity technologies",
			children: [
				{ name: "Ethical Hacking", slug: "ethical-hacking", description: "Authorized testing of systems for vulnerabilities" },
				{ name: "Penetration Testing", slug: "penetration-testing", description: "Simulated cyber attacks to test system security" },
				{ name: "Network Security", slug: "network-security", description: "Protection of computer networks from threats" },
				{ name: "Web Application Security", slug: "web-app-security", description: "Security practices for web applications" },
				{ name: "Cryptography", slug: "cryptography", description: "Techniques for secure communication" },
				{ name: "OWASP", slug: "owasp", description: "Open Web Application Security Project standards" },
				{ name: "Security Auditing", slug: "security-auditing", description: "Systematic evaluation of security systems" },
				{ name: "Incident Response", slug: "incident-response", description: "Approach to handling security breaches" },
				{ name: "Malware Analysis", slug: "malware-analysis", description: "Study of malicious software behavior" },
				{ name: "Digital Forensics", slug: "digital-forensics", description: "Investigation of digital evidence" },
			],
		},
		// Game Development
		{
			name: "Game Development",
			slug: "game-development",
			description: "Technologies for creating video games and interactive media",
			children: [
				{ name: "Unity", slug: "unity", description: "Cross-platform game engine" },
				{ name: "Unreal Engine", slug: "unreal-engine", description: "Game engine developed by Epic Games" },
				{ name: "Godot", slug: "godot", description: "Open source game engine" },
				{ name: "C++ Game Development", slug: "cpp-game-dev", description: "Game development using C++" },
				{ name: "C# Unity", slug: "csharp-unity", description: "C# programming for Unity engine" },
				{ name: "GDScript", slug: "gdscript", description: "Scripting language for Godot engine" },
				{ name: "Blender", slug: "blender", description: "3D creation suite for modeling and animation" },
				{ name: "OpenGL", slug: "opengl", description: "Graphics API for rendering 2D and 3D graphics" },
				{ name: "DirectX", slug: "directx", description: "Collection of APIs for multimedia and gaming" },
				{ name: "Vulkan", slug: "vulkan", description: "Low-overhead graphics and compute API" },
			],
		},
		// UI/UX Design
		{
			name: "UI/UX Design",
			slug: "ui-ux-design",
			description: "User interface and user experience design tools and methodologies",
			children: [
				{ name: "Figma", slug: "figma", description: "Collaborative interface design tool" },
				{ name: "Adobe XD", slug: "adobe-xd", description: "Vector-based user experience design tool" },
				{ name: "Sketch", slug: "sketch", description: "Digital design toolkit for Mac" },
				{ name: "Adobe Photoshop", slug: "photoshop", description: "Raster graphics editor" },
				{ name: "Adobe Illustrator", slug: "illustrator", description: "Vector graphics editor" },
				{ name: "InVision", slug: "invision", description: "Digital product design platform" },
				{ name: "Principle", slug: "principle", description: "Animated and interactive user interface design tool" },
				{ name: "Framer", slug: "framer", description: "Interactive design and prototyping tool" },
				{ name: "Prototyping", slug: "prototyping", description: "Creating early models of software products" },
				{ name: "User Research", slug: "user-research", description: "Methods for understanding user needs and behaviors" },
				{ name: "Wireframing", slug: "wireframing", description: "Creating structural blueprints for web pages" },
				{ name: "Design Systems", slug: "design-systems", description: "Collection of reusable components and guidelines" },
			],
		},
		// Blockchain & Web3
		{
			name: "Blockchain & Web3",
			slug: "blockchain-web3",
			description: "Blockchain technology and decentralized applications",
			children: [
				{ name: "Ethereum", slug: "ethereum", description: "Decentralized platform for smart contracts" },
				{ name: "Solidity", slug: "solidity", description: "Programming language for Ethereum smart contracts" },
				{ name: "Smart Contracts", slug: "smart-contracts", description: "Self-executing contracts with terms directly written into code" },
				{ name: "DApps", slug: "dapps", description: "Decentralized applications" },
				{ name: "Web3.js", slug: "web3js", description: "JavaScript library for interacting with Ethereum" },
				{ name: "Truffle", slug: "truffle", description: "Development environment for Ethereum" },
				{ name: "Hardhat", slug: "hardhat", description: "Ethereum development environment" },
				{ name: "IPFS", slug: "ipfs", description: "Distributed file system" },
				{ name: "Bitcoin", slug: "bitcoin", description: "Cryptocurrency and blockchain network" },
				{ name: "Hyperledger", slug: "hyperledger", description: "Open source blockchain technologies" },
			],
		},
		// Quality Assurance & Testing
		{
			name: "Quality Assurance & Testing",
			slug: "qa-testing",
			description: "Software testing frameworks and methodologies",
			children: [
				{ name: "Jest", slug: "jest", description: "JavaScript testing framework" },
				{ name: "Cypress", slug: "cypress", description: "End-to-end testing framework" },
				{ name: "Selenium", slug: "selenium", description: "Web browser automation" },
				{ name: "Playwright", slug: "playwright", description: "Cross-browser automation library" },
				{ name: "Puppeteer", slug: "puppeteer", description: "Node.js library for controlling headless Chrome" },
				{ name: "JUnit", slug: "junit", description: "Unit testing framework for Java" },
				{ name: "PyTest", slug: "pytest", description: "Testing framework for Python" },
				{ name: "Mocha", slug: "mocha", description: "JavaScript test framework" },
				{ name: "Jasmine", slug: "jasmine", description: "Behavior-driven development framework" },
				{ name: "TestNG", slug: "testng", description: "Testing framework for Java" },
				{ name: "Postman", slug: "postman", description: "API development and testing platform" },
				{ name: "Load Testing", slug: "load-testing", description: "Testing system performance under expected load" },
				{ name: "Unit Testing", slug: "unit-testing", description: "Testing individual units of source code" },
				{ name: "Integration Testing", slug: "integration-testing", description: "Testing interfaces between components" },
				{ name: "Test Automation", slug: "test-automation", description: "Automated execution of test cases" },
			],
		},
		// Project Management & Collaboration
		{
			name: "Project Management & Collaboration",
			slug: "project-management-collaboration",
			description: "Tools and methodologies for managing projects and team collaboration",
			children: [
				{ name: "Agile", slug: "agile", description: "Iterative approach to project management" },
				{ name: "Scrum", slug: "scrum", description: "Framework for managing product development" },
				{ name: "Kanban", slug: "kanban", description: "Visual system for managing work" },
				{ name: "Jira", slug: "jira", description: "Issue and project tracking software" },
				{ name: "Confluence", slug: "confluence", description: "Team workspace for documentation" },
				{ name: "Trello", slug: "trello", description: "Web-based Kanban-style project management application" },
				{ name: "Asana", slug: "asana", description: "Web and mobile application for team collaboration" },
				{ name: "Notion", slug: "notion", description: "All-in-one workspace for notes and collaboration" },
				{ name: "Monday.com", slug: "monday", description: "Work management platform" },
				{ name: "Slack", slug: "slack", description: "Business communication platform" },
				{ name: "Microsoft Teams", slug: "teams", description: "Business communication and collaboration platform" },
				{ name: "Discord", slug: "discord", description: "VoIP and instant messaging application" },
				{ name: "Git", slug: "git", description: "Distributed version control system" },
				{ name: "GitHub", slug: "github", description: "Web-based hosting service for Git repositories" },
				{ name: "GitLab", slug: "gitlab", description: "Web-based DevOps lifecycle tool" },
				{ name: "Bitbucket", slug: "bitbucket", description: "Git repository management solution" },
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

		// create child skills
		for (const childData of skillData.children) {
			const existingChild = await prisma.skill.findFirst({
				where: {
					OR: [{ slug: childData.slug }, { name: childData.name }],
				},
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

	// seed verification questions for some skills
	console.log("");
	console.log("📝 Seeding verification questions...");

	// get some skills to add verification questions
	const reactSkill = await prisma.skill.findUnique({ where: { slug: "react" } });
	const typescriptSkill = await prisma.skill.findUnique({ where: { slug: "typescript" } });
	const nodeSkill = await prisma.skill.findUnique({ where: { slug: "nodejs" } });

	if (reactSkill) {
		const existingQuestions = await prisma.skillVerificationQuestion.count({
			where: { skillId: reactSkill.id },
		});

		if (existingQuestions === 0) {
			const reactQuestions = [
				{
					questionText: "What is the purpose of the useEffect hook in React?",
					difficultyLevel: "INTERMEDIATE",
					points: 1,
					order: 0,
					choices: [
						{ text: "To manage side effects in functional components", isCorrect: true },
						{ text: "To create state variables", isCorrect: false },
						{ text: "To handle user input", isCorrect: false },
						{ text: "To render JSX elements", isCorrect: false },
					],
				},
				{
					questionText: "Which of the following are correct ways to pass data from parent to child components in React?",
					difficultyLevel: "INTERMEDIATE",
					points: 1,
					order: 1,
					choices: [
						{ text: "Using props", isCorrect: true },
						{ text: "Using context API", isCorrect: true },
						{ text: "Using localStorage", isCorrect: false },
						{ text: "Direct variable assignment", isCorrect: false },
					],
				},
				{
					questionText: "What does React.memo() do?",
					difficultyLevel: "ADVANCED",
					points: 1,
					order: 2,
					choices: [
						{ text: "Prevents unnecessary re-renders by memoizing components", isCorrect: true },
						{ text: "Stores component data in memory", isCorrect: false },
						{ text: "Creates a memory snapshot", isCorrect: false },
						{ text: "Increases component load time", isCorrect: false },
					],
				},
				{
					questionText: "Which hooks can cause infinite loops if used incorrectly?",
					difficultyLevel: "ADVANCED",
					points: 1,
					order: 3,
					choices: [
						{ text: "useEffect without dependency array", isCorrect: true },
						{ text: "useEffect with state updates that trigger re-render", isCorrect: true },
						{ text: "useState", isCorrect: false },
						{ text: "useRef", isCorrect: false },
					],
				},
				{
					questionText: "What is the correct way to update state based on previous state in React?",
					difficultyLevel: "INTERMEDIATE",
					points: 1,
					order: 4,
					choices: [
						{ text: "Use functional update form: setState(prev => prev + 1)", isCorrect: true },
						{ text: "Directly access state: setState(state + 1)", isCorrect: false },
						{ text: "Use this.state", isCorrect: false },
						{ text: "Use global variable", isCorrect: false },
					],
				},
				{
					questionText: "Which of the following are valid ways to handle forms in React?",
					difficultyLevel: "INTERMEDIATE",
					points: 1,
					order: 5,
					choices: [
						{ text: "Controlled components with state", isCorrect: true },
						{ text: "Uncontrolled components with refs", isCorrect: true },
						{ text: "Direct DOM manipulation", isCorrect: false },
						{ text: "jQuery form handling", isCorrect: false },
					],
				},
				{
					questionText: "What is the purpose of keys in React lists?",
					difficultyLevel: "INTERMEDIATE",
					points: 1,
					order: 6,
					choices: [
						{ text: "To help React identify which items changed, were added, or removed", isCorrect: true },
						{ text: "To style list items", isCorrect: false },
						{ text: "To sort list items", isCorrect: false },
						{ text: "To encrypt data", isCorrect: false },
					],
				},
				{
					questionText: "Which statements about React Context are true?",
					difficultyLevel: "ADVANCED",
					points: 1,
					order: 7,
					choices: [
						{ text: "Context provides a way to pass data through the component tree without props drilling", isCorrect: true },
						{ text: "Context re-renders all consuming components when value changes", isCorrect: true },
						{ text: "Context is only for authentication", isCorrect: false },
						{ text: "Context cannot be used with hooks", isCorrect: false },
					],
				},
				{
					questionText: "What is React Suspense used for?",
					difficultyLevel: "EXPERT",
					points: 1,
					order: 8,
					choices: [
						{ text: "Handling asynchronous rendering and code-splitting", isCorrect: true },
						{ text: "Pausing component execution", isCorrect: false },
						{ text: "Error handling", isCorrect: false },
						{ text: "Animation control", isCorrect: false },
					],
				},
				{
					questionText: "Which are correct patterns for optimizing React performance?",
					difficultyLevel: "EXPERT",
					points: 1,
					order: 9,
					choices: [
						{ text: "Using React.memo for expensive components", isCorrect: true },
						{ text: "Implementing useMemo and useCallback for expensive computations", isCorrect: true },
						{ text: "Code splitting with lazy loading", isCorrect: true },
						{ text: "Forcing re-renders on every state change", isCorrect: false },
					],
				},
			];

			for (const q of reactQuestions) {
				await prisma.skillVerificationQuestion.create({
					data: {
						skillId: reactSkill.id,
						questionText: q.questionText,
						difficultyLevel: q.difficultyLevel as any,
						points: q.points,
						order: q.order,
						choices: {
							create: q.choices.map((choice, idx) => ({
								choiceText: choice.text,
								label: ["A", "B", "C", "D"][idx],
								isCorrect: choice.isCorrect,
								order: idx,
							})),
						},
					},
				});
			}
			console.log(`   ✅ Created ${reactQuestions.length} verification questions for React`);
		} else {
			console.log(`   ⏭️  React already has verification questions`);
		}
	}

	if (typescriptSkill) {
		const existingQuestions = await prisma.skillVerificationQuestion.count({
			where: { skillId: typescriptSkill.id },
		});

		if (existingQuestions === 0) {
			const tsQuestions = [
				{
					questionText: "What is the main purpose of TypeScript?",
					difficultyLevel: "INTERMEDIATE",
					points: 1,
					order: 0,
					choices: [
						{ text: "To add static type checking to JavaScript", isCorrect: true },
						{ text: "To replace JavaScript entirely", isCorrect: false },
						{ text: "To make JavaScript run faster", isCorrect: false },
						{ text: "To compile to machine code", isCorrect: false },
					],
				},
				{
					questionText: "Which of the following are valid TypeScript utility types?",
					difficultyLevel: "ADVANCED",
					points: 1,
					order: 1,
					choices: [
						{ text: "Partial<T>", isCorrect: true },
						{ text: "Required<T>", isCorrect: true },
						{ text: "Readonly<T>", isCorrect: true },
						{ text: "Mutable<T>", isCorrect: false },
					],
				},
				{
					questionText: "What is type narrowing in TypeScript?",
					difficultyLevel: "ADVANCED",
					points: 1,
					order: 2,
					choices: [
						{ text: "Refining types based on conditional checks", isCorrect: true },
						{ text: "Reducing file size", isCorrect: false },
						{ text: "Removing unused types", isCorrect: false },
						{ text: "Converting types to strings", isCorrect: false },
					],
				},
				{
					questionText: "Which keywords can be used for type guards in TypeScript?",
					difficultyLevel: "ADVANCED",
					points: 1,
					order: 3,
					choices: [
						{ text: "typeof", isCorrect: true },
						{ text: "instanceof", isCorrect: true },
						{ text: "in", isCorrect: true },
						{ text: "has", isCorrect: false },
					],
				},
				{
					questionText: "What does the 'never' type represent in TypeScript?",
					difficultyLevel: "EXPERT",
					points: 1,
					order: 4,
					choices: [
						{ text: "Values that never occur or functions that never return", isCorrect: true },
						{ text: "Null or undefined values", isCorrect: false },
						{ text: "Empty objects", isCorrect: false },
						{ text: "Boolean false", isCorrect: false },
					],
				},
				{
					questionText: "Which are correct ways to define optional properties in TypeScript?",
					difficultyLevel: "INTERMEDIATE",
					points: 1,
					order: 5,
					choices: [
						{ text: "property?: string", isCorrect: true },
						{ text: "property: string | undefined", isCorrect: true },
						{ text: "property: optional string", isCorrect: false },
						{ text: "optional property: string", isCorrect: false },
					],
				},
				{
					questionText: "What is the purpose of generics in TypeScript?",
					difficultyLevel: "ADVANCED",
					points: 1,
					order: 6,
					choices: [
						{ text: "To create reusable components that work with multiple types", isCorrect: true },
						{ text: "To generate code automatically", isCorrect: false },
						{ text: "To improve runtime performance", isCorrect: false },
						{ text: "To create global variables", isCorrect: false },
					],
				},
				{
					questionText: "Which statements about interfaces and types in TypeScript are true?",
					difficultyLevel: "ADVANCED",
					points: 1,
					order: 7,
					choices: [
						{ text: "Interfaces can be extended and merged", isCorrect: true },
						{ text: "Types can use union and intersection operators", isCorrect: true },
						{ text: "Interfaces and types are completely interchangeable", isCorrect: false },
						{ text: "Types cannot be used for object shapes", isCorrect: false },
					],
				},
				{
					questionText: "What is mapped type in TypeScript?",
					difficultyLevel: "EXPERT",
					points: 1,
					order: 8,
					choices: [
						{ text: "A type that transforms properties of another type", isCorrect: true },
						{ text: "A JavaScript Map converted to a type", isCorrect: false },
						{ text: "A type stored in memory", isCorrect: false },
						{ text: "A geographic coordinate type", isCorrect: false },
					],
				},
				{
					questionText: "Which are valid TypeScript conditional type patterns?",
					difficultyLevel: "EXPERT",
					points: 1,
					order: 9,
					choices: [
						{ text: "T extends U ? X : Y", isCorrect: true },
						{ text: "infer keyword for type inference", isCorrect: true },
						{ text: "Distributive conditional types over unions", isCorrect: true },
						{ text: "if-else statements in types", isCorrect: false },
					],
				},
			];

			for (const q of tsQuestions) {
				await prisma.skillVerificationQuestion.create({
					data: {
						skillId: typescriptSkill.id,
						questionText: q.questionText,
						difficultyLevel: q.difficultyLevel as any,
						points: q.points,
						order: q.order,
						choices: {
							create: q.choices.map((choice, idx) => ({
								choiceText: choice.text,
								label: ["A", "B", "C", "D"][idx],
								isCorrect: choice.isCorrect,
								order: idx,
							})),
						},
					},
				});
			}
			console.log(`   ✅ Created ${tsQuestions.length} verification questions for TypeScript`);
		} else {
			console.log(`   ⏭️  TypeScript already has verification questions`);
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
