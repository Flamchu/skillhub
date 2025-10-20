// script to generate verification questions for all major skills
// run with: yarn ts-node src/scripts/generateVerificationQuestions.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface QuestionData {
	questionText: string;
	difficultyLevel: "INTERMEDIATE" | "ADVANCED" | "EXPERT";
	points: number;
	order: number;
	choices: { text: string; isCorrect: boolean }[];
}

// verification questions for each skill
const skillQuestions: Record<string, QuestionData[]> = {
	javascript: [
		{
			questionText: "what is the difference between '==' and '===' in javascript?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 0,
			choices: [
				{ text: "'===' checks both value and type, '==' only checks value", isCorrect: true },
				{ text: "they are the same", isCorrect: false },
				{ text: "'==' is faster than '==='", isCorrect: false },
				{ text: "'===' is deprecated", isCorrect: false },
			],
		},
		{
			questionText: "which of the following are falsy values in javascript?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 1,
			choices: [
				{ text: "0, null, undefined", isCorrect: true },
				{ text: "false, '', NaN", isCorrect: true },
				{ text: "empty array []", isCorrect: false },
				{ text: "empty object {}", isCorrect: false },
			],
		},
		{
			questionText: "what is a closure in javascript?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 2,
			choices: [
				{ text: "a function with access to variables from its outer scope", isCorrect: true },
				{ text: "a closed function that cannot be called", isCorrect: false },
				{ text: "a function without parameters", isCorrect: false },
				{ text: "a deprecated feature", isCorrect: false },
			],
		},
		{
			questionText: "which array methods mutate the original array?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 3,
			choices: [
				{ text: "push(), pop(), splice()", isCorrect: true },
				{ text: "sort(), reverse()", isCorrect: true },
				{ text: "map(), filter()", isCorrect: false },
				{ text: "slice(), concat()", isCorrect: false },
			],
		},
		{
			questionText: "what is event bubbling in javascript?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 4,
			choices: [
				{ text: "events propagate from child to parent elements", isCorrect: true },
				{ text: "events create bubbles in memory", isCorrect: false },
				{ text: "events are stored in a queue", isCorrect: false },
				{ text: "events are discarded after firing", isCorrect: false },
			],
		},
		{
			questionText: "which statements about promises are correct?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 5,
			choices: [
				{ text: "promises have three states: pending, fulfilled, rejected", isCorrect: true },
				{ text: "promises can be chained with .then()", isCorrect: true },
				{ text: "promises execute synchronously", isCorrect: false },
				{ text: "promises cannot be cancelled", isCorrect: true },
			],
		},
		{
			questionText: "what does the 'this' keyword refer to in javascript?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 6,
			choices: [
				{ text: "the execution context where the function is called", isCorrect: true },
				{ text: "always the global object", isCorrect: false },
				{ text: "the function itself", isCorrect: false },
				{ text: "the parent scope", isCorrect: false },
			],
		},
		{
			questionText: "which are valid ways to create objects in javascript?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 7,
			choices: [
				{ text: "object literals { }", isCorrect: true },
				{ text: "constructor functions with new", isCorrect: true },
				{ text: "Object.create()", isCorrect: true },
				{ text: "class syntax", isCorrect: true },
			],
		},
		{
			questionText: "what is the temporal dead zone in javascript?",
			difficultyLevel: "EXPERT",
			points: 1,
			order: 8,
			choices: [
				{ text: "period between entering scope and variable declaration with let/const", isCorrect: true },
				{ text: "time when variables are destroyed", isCorrect: false },
				{ text: "delay in async operations", isCorrect: false },
				{ text: "memory allocation phase", isCorrect: false },
			],
		},
		{
			questionText: "which patterns improve javascript performance?",
			difficultyLevel: "EXPERT",
			points: 1,
			order: 9,
			choices: [
				{ text: "debouncing and throttling event handlers", isCorrect: true },
				{ text: "minimizing dom manipulations", isCorrect: true },
				{ text: "using web workers for heavy computations", isCorrect: true },
				{ text: "synchronous operations over async", isCorrect: false },
			],
		},
	],

	nodejs: [
		{
			questionText: "what is the event loop in node.js?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 0,
			choices: [
				{ text: "mechanism that handles asynchronous operations", isCorrect: true },
				{ text: "loop that creates events", isCorrect: false },
				{ text: "debugging tool", isCorrect: false },
				{ text: "package manager", isCorrect: false },
			],
		},
		{
			questionText: "which are core node.js modules?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 1,
			choices: [
				{ text: "fs, http, path", isCorrect: true },
				{ text: "os, crypto, stream", isCorrect: true },
				{ text: "react, vue", isCorrect: false },
				{ text: "jquery, lodash", isCorrect: false },
			],
		},
		{
			questionText: "what is the purpose of package.json?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 2,
			choices: [
				{ text: "manages project dependencies and metadata", isCorrect: true },
				{ text: "stores user passwords", isCorrect: false },
				{ text: "compiles javascript code", isCorrect: false },
				{ text: "creates database schemas", isCorrect: false },
			],
		},
		{
			questionText: "which statements about streams in node.js are true?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 3,
			choices: [
				{ text: "streams handle data in chunks for memory efficiency", isCorrect: true },
				{ text: "there are readable, writable, and duplex streams", isCorrect: true },
				{ text: "streams are synchronous only", isCorrect: false },
				{ text: "streams cannot pipe data", isCorrect: false },
			],
		},
		{
			questionText: "what is middleware in express.js?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 4,
			choices: [
				{ text: "functions that process requests before reaching route handlers", isCorrect: true },
				{ text: "database connector", isCorrect: false },
				{ text: "frontend framework", isCorrect: false },
				{ text: "testing tool", isCorrect: false },
			],
		},
		{
			questionText: "which are valid ways to handle errors in node.js?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 5,
			choices: [
				{ text: "try-catch blocks for synchronous code", isCorrect: true },
				{ text: ".catch() for promises", isCorrect: true },
				{ text: "error-first callbacks", isCorrect: true },
				{ text: "ignoring errors completely", isCorrect: false },
			],
		},
		{
			questionText: "what is process.env in node.js?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 6,
			choices: [
				{ text: "object containing environment variables", isCorrect: true },
				{ text: "process monitoring tool", isCorrect: false },
				{ text: "environment setup script", isCorrect: false },
				{ text: "deployment configuration", isCorrect: false },
			],
		},
		{
			questionText: "which patterns improve node.js application performance?",
			difficultyLevel: "EXPERT",
			points: 1,
			order: 7,
			choices: [
				{ text: "clustering for multi-core utilization", isCorrect: true },
				{ text: "caching frequently accessed data", isCorrect: true },
				{ text: "connection pooling for databases", isCorrect: true },
				{ text: "blocking the event loop", isCorrect: false },
			],
		},
		{
			questionText: "what is the purpose of buffer in node.js?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 8,
			choices: [
				{ text: "handles binary data efficiently", isCorrect: true },
				{ text: "buffers network requests", isCorrect: false },
				{ text: "stores cache data", isCorrect: false },
				{ text: "manages memory allocation", isCorrect: false },
			],
		},
		{
			questionText: "which statements about npm are correct?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 9,
			choices: [
				{ text: "npm is the default package manager for node.js", isCorrect: true },
				{ text: "npm can install packages locally and globally", isCorrect: true },
				{ text: "npm only works with javascript", isCorrect: false },
				{ text: "npm cannot update packages", isCorrect: false },
			],
		},
	],

	python: [
		{
			questionText: "what is the difference between lists and tuples in python?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 0,
			choices: [
				{ text: "lists are mutable, tuples are immutable", isCorrect: true },
				{ text: "they are identical", isCorrect: false },
				{ text: "tuples are faster in all cases", isCorrect: false },
				{ text: "lists cannot store strings", isCorrect: false },
			],
		},
		{
			questionText: "which are valid ways to create a dictionary in python?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 1,
			choices: [
				{ text: "{'key': 'value'}", isCorrect: true },
				{ text: "dict(key='value')", isCorrect: true },
				{ text: "dict([('key', 'value')])", isCorrect: true },
				{ text: "['key': 'value']", isCorrect: false },
			],
		},
		{
			questionText: "what is a decorator in python?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 2,
			choices: [
				{ text: "function that modifies another function's behavior", isCorrect: true },
				{ text: "styling tool for output", isCorrect: false },
				{ text: "database migration tool", isCorrect: false },
				{ text: "testing framework", isCorrect: false },
			],
		},
		{
			questionText: "which statements about python generators are true?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 3,
			choices: [
				{ text: "generators use yield instead of return", isCorrect: true },
				{ text: "generators are memory efficient for large datasets", isCorrect: true },
				{ text: "generators evaluate lazily", isCorrect: true },
				{ text: "generators store all values in memory", isCorrect: false },
			],
		},
		{
			questionText: "what is the global interpreter lock (gil) in python?",
			difficultyLevel: "EXPERT",
			points: 1,
			order: 4,
			choices: [
				{ text: "mutex that protects python objects preventing multiple threads from executing python bytecode at once", isCorrect: true },
				{ text: "security feature for global variables", isCorrect: false },
				{ text: "lock for file operations", isCorrect: false },
				{ text: "network security protocol", isCorrect: false },
			],
		},
		{
			questionText: "which are valid ways to handle exceptions in python?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 5,
			choices: [
				{ text: "try-except blocks", isCorrect: true },
				{ text: "try-except-else-finally", isCorrect: true },
				{ text: "raise keyword for custom exceptions", isCorrect: true },
				{ text: "catch-throw blocks", isCorrect: false },
			],
		},
		{
			questionText: "what is list comprehension in python?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 6,
			choices: [
				{ text: "concise way to create lists based on existing iterables", isCorrect: true },
				{ text: "documentation for lists", isCorrect: false },
				{ text: "list sorting algorithm", isCorrect: false },
				{ text: "list encryption method", isCorrect: false },
			],
		},
		{
			questionText: "which are built-in data types in python?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 7,
			choices: [
				{ text: "int, float, str, bool", isCorrect: true },
				{ text: "list, tuple, set, dict", isCorrect: true },
				{ text: "array, vector", isCorrect: false },
				{ text: "pointer, reference", isCorrect: false },
			],
		},
		{
			questionText: "what is the purpose of *args and **kwargs?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 8,
			choices: [
				{ text: "*args for variable positional arguments, **kwargs for variable keyword arguments", isCorrect: true },
				{ text: "they are multiplication operators", isCorrect: false },
				{ text: "they are pointer dereferencing operators", isCorrect: false },
				{ text: "they are deprecated syntax", isCorrect: false },
			],
		},
		{
			questionText: "which statements about python's asyncio are correct?",
			difficultyLevel: "EXPERT",
			points: 1,
			order: 9,
			choices: [
				{ text: "asyncio provides infrastructure for writing asynchronous code", isCorrect: true },
				{ text: "uses async/await syntax", isCorrect: true },
				{ text: "enables concurrent i/o operations", isCorrect: true },
				{ text: "asyncio is only for web development", isCorrect: false },
			],
		},
	],

	docker: [
		{
			questionText: "what is a docker container?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 0,
			choices: [
				{ text: "lightweight, standalone executable package with application and dependencies", isCorrect: true },
				{ text: "virtual machine", isCorrect: false },
				{ text: "cloud storage service", isCorrect: false },
				{ text: "database system", isCorrect: false },
			],
		},
		{
			questionText: "which are valid docker commands?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 1,
			choices: [
				{ text: "docker build, docker run", isCorrect: true },
				{ text: "docker ps, docker stop", isCorrect: true },
				{ text: "docker exec, docker logs", isCorrect: true },
				{ text: "docker install, docker deploy", isCorrect: false },
			],
		},
		{
			questionText: "what is the purpose of a dockerfile?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 2,
			choices: [
				{ text: "text document containing commands to assemble a docker image", isCorrect: true },
				{ text: "log file for docker operations", isCorrect: false },
				{ text: "configuration for docker desktop", isCorrect: false },
				{ text: "backup of container data", isCorrect: false },
			],
		},
		{
			questionText: "which statements about docker volumes are true?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 3,
			choices: [
				{ text: "volumes persist data beyond container lifecycle", isCorrect: true },
				{ text: "volumes can be shared between containers", isCorrect: true },
				{ text: "volumes are managed by docker", isCorrect: true },
				{ text: "volumes are destroyed when container stops", isCorrect: false },
			],
		},
		{
			questionText: "what is docker compose used for?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 4,
			choices: [
				{ text: "defining and running multi-container docker applications", isCorrect: true },
				{ text: "writing dockerfile content", isCorrect: false },
				{ text: "monitoring container performance", isCorrect: false },
				{ text: "encrypting container data", isCorrect: false },
			],
		},
		{
			questionText: "which are best practices for docker images?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 5,
			choices: [
				{ text: "use multi-stage builds to reduce image size", isCorrect: true },
				{ text: "minimize number of layers", isCorrect: true },
				{ text: "use specific tags instead of 'latest'", isCorrect: true },
				{ text: "include sensitive data in images", isCorrect: false },
			],
		},
		{
			questionText: "what is the difference between CMD and ENTRYPOINT?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 6,
			choices: [
				{ text: "ENTRYPOINT defines container executable, CMD provides default arguments", isCorrect: true },
				{ text: "they are identical", isCorrect: false },
				{ text: "CMD is deprecated", isCorrect: false },
				{ text: "ENTRYPOINT is for windows only", isCorrect: false },
			],
		},
		{
			questionText: "which docker networking modes are available?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 7,
			choices: [
				{ text: "bridge, host, none", isCorrect: true },
				{ text: "overlay, macvlan", isCorrect: true },
				{ text: "public, private", isCorrect: false },
				{ text: "secure, insecure", isCorrect: false },
			],
		},
		{
			questionText: "what is a docker registry?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 8,
			choices: [
				{ text: "service for storing and distributing docker images", isCorrect: true },
				{ text: "list of running containers", isCorrect: false },
				{ text: "container monitoring tool", isCorrect: false },
				{ text: "docker configuration file", isCorrect: false },
			],
		},
		{
			questionText: "which strategies optimize docker build times?",
			difficultyLevel: "EXPERT",
			points: 1,
			order: 9,
			choices: [
				{ text: "leverage build cache effectively", isCorrect: true },
				{ text: "order dockerfile commands from least to most frequently changing", isCorrect: true },
				{ text: "use .dockerignore to exclude unnecessary files", isCorrect: true },
				{ text: "rebuild everything from scratch each time", isCorrect: false },
			],
		},
	],

	postgresql: [
		{
			questionText: "what is the purpose of indexes in postgresql?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 0,
			choices: [
				{ text: "improve query performance by providing faster data access", isCorrect: true },
				{ text: "store backup data", isCorrect: false },
				{ text: "encrypt database contents", isCorrect: false },
				{ text: "compress tables", isCorrect: false },
			],
		},
		{
			questionText: "which are valid postgresql data types?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 1,
			choices: [
				{ text: "integer, varchar, text", isCorrect: true },
				{ text: "json, jsonb, uuid", isCorrect: true },
				{ text: "timestamp, date, boolean", isCorrect: true },
				{ text: "string, number, array", isCorrect: false },
			],
		},
		{
			questionText: "what is a transaction in postgresql?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 2,
			choices: [
				{ text: "sequence of operations performed as single logical unit of work", isCorrect: true },
				{ text: "data transfer between databases", isCorrect: false },
				{ text: "monetary operation", isCorrect: false },
				{ text: "user authentication process", isCorrect: false },
			],
		},
		{
			questionText: "which statements about postgresql joins are correct?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 3,
			choices: [
				{ text: "inner join returns matching rows from both tables", isCorrect: true },
				{ text: "left join returns all rows from left table", isCorrect: true },
				{ text: "full outer join combines left and right joins", isCorrect: true },
				{ text: "joins can only combine two tables", isCorrect: false },
			],
		},
		{
			questionText: "what is mvcc in postgresql?",
			difficultyLevel: "EXPERT",
			points: 1,
			order: 4,
			choices: [
				{ text: "multi-version concurrency control allows multiple transactions simultaneously", isCorrect: true },
				{ text: "database versioning system", isCorrect: false },
				{ text: "migration control tool", isCorrect: false },
				{ text: "monitoring service", isCorrect: false },
			],
		},
		{
			questionText: "which are postgresql constraint types?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 5,
			choices: [
				{ text: "primary key, foreign key", isCorrect: true },
				{ text: "unique, not null, check", isCorrect: true },
				{ text: "default, exclude", isCorrect: true },
				{ text: "optional, mandatory", isCorrect: false },
			],
		},
		{
			questionText: "what is the purpose of vacuum in postgresql?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 6,
			choices: [
				{ text: "reclaims storage occupied by dead tuples", isCorrect: true },
				{ text: "deletes all data", isCorrect: false },
				{ text: "compresses database files", isCorrect: false },
				{ text: "backs up database", isCorrect: false },
			],
		},
		{
			questionText: "which are valid postgresql index types?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 7,
			choices: [
				{ text: "b-tree (default)", isCorrect: true },
				{ text: "hash, gin, gist", isCorrect: true },
				{ text: "brin, sp-gist", isCorrect: true },
				{ text: "array, json", isCorrect: false },
			],
		},
		{
			questionText: "what is a postgresql view?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 8,
			choices: [
				{ text: "virtual table based on result of sql query", isCorrect: true },
				{ text: "database backup", isCorrect: false },
				{ text: "user interface", isCorrect: false },
				{ text: "monitoring dashboard", isCorrect: false },
			],
		},
		{
			questionText: "which postgresql features improve query performance?",
			difficultyLevel: "EXPERT",
			points: 1,
			order: 9,
			choices: [
				{ text: "proper indexing strategies", isCorrect: true },
				{ text: "query optimization and explain analyze", isCorrect: true },
				{ text: "partitioning large tables", isCorrect: true },
				{ text: "disabling all constraints", isCorrect: false },
			],
		},
	],

	git: [
		{
			questionText: "what is the purpose of git branches?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 0,
			choices: [
				{ text: "allow parallel development and feature isolation", isCorrect: true },
				{ text: "store old code versions", isCorrect: false },
				{ text: "organize file directories", isCorrect: false },
				{ text: "encrypt repository data", isCorrect: false },
			],
		},
		{
			questionText: "which are valid git commands?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 1,
			choices: [
				{ text: "git add, git commit", isCorrect: true },
				{ text: "git push, git pull", isCorrect: true },
				{ text: "git branch, git merge", isCorrect: true },
				{ text: "git install, git deploy", isCorrect: false },
			],
		},
		{
			questionText: "what is the difference between git merge and git rebase?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 2,
			choices: [
				{ text: "merge preserves history, rebase rewrites history linearly", isCorrect: true },
				{ text: "they are identical", isCorrect: false },
				{ text: "rebase is deprecated", isCorrect: false },
				{ text: "merge is faster than rebase", isCorrect: false },
			],
		},
		{
			questionText: "which statements about git reset are true?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 3,
			choices: [
				{ text: "--soft keeps changes staged", isCorrect: true },
				{ text: "--mixed unstages changes but keeps them in working directory", isCorrect: true },
				{ text: "--hard discards all changes", isCorrect: true },
				{ text: "reset cannot be undone", isCorrect: false },
			],
		},
		{
			questionText: "what is a git conflict?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 4,
			choices: [
				{ text: "occurs when same part of file is modified in different branches", isCorrect: true },
				{ text: "permission error", isCorrect: false },
				{ text: "network connection issue", isCorrect: false },
				{ text: "corrupted repository", isCorrect: false },
			],
		},
		{
			questionText: "which are valid ways to undo commits in git?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 5,
			choices: [
				{ text: "git revert creates new commit that undoes changes", isCorrect: true },
				{ text: "git reset moves branch pointer", isCorrect: true },
				{ text: "git checkout -- file discards local changes", isCorrect: true },
				{ text: "git delete permanently removes commits", isCorrect: false },
			],
		},
		{
			questionText: "what is the purpose of .gitignore?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 6,
			choices: [
				{ text: "specifies files git should not track", isCorrect: true },
				{ text: "lists ignored users", isCorrect: false },
				{ text: "configures git settings", isCorrect: false },
				{ text: "stores passwords", isCorrect: false },
			],
		},
		{
			questionText: "which git commands help investigate repository history?",
			difficultyLevel: "INTERMEDIATE",
			points: 1,
			order: 7,
			choices: [
				{ text: "git log shows commit history", isCorrect: true },
				{ text: "git blame shows who modified each line", isCorrect: true },
				{ text: "git diff compares changes", isCorrect: true },
				{ text: "git history displays timeline", isCorrect: false },
			],
		},
		{
			questionText: "what is a git stash?",
			difficultyLevel: "ADVANCED",
			points: 1,
			order: 8,
			choices: [
				{ text: "temporarily saves uncommitted changes", isCorrect: true },
				{ text: "permanent storage for old code", isCorrect: false },
				{ text: "remote backup service", isCorrect: false },
				{ text: "branch naming convention", isCorrect: false },
			],
		},
		{
			questionText: "which are git workflow best practices?",
			difficultyLevel: "EXPERT",
			points: 1,
			order: 9,
			choices: [
				{ text: "write clear, descriptive commit messages", isCorrect: true },
				{ text: "commit small, logical changes frequently", isCorrect: true },
				{ text: "pull before pushing to avoid conflicts", isCorrect: true },
				{ text: "commit directly to main/master branch", isCorrect: false },
			],
		},
	],
};

async function generateQuestions() {
	console.log("🔧 generating verification questions for all skills...\n");

	let createdCount = 0;
	let skippedCount = 0;

	for (const [skillSlug, questions] of Object.entries(skillQuestions)) {
		const skill = await prisma.skill.findUnique({
			where: { slug: skillSlug },
		});

		if (!skill) {
			console.log(`   ⚠️  skill '${skillSlug}' not found, skipping...`);
			skippedCount++;
			continue;
		}

		const existingQuestions = await prisma.skillVerificationQuestion.count({
			where: { skillId: skill.id },
		});

		if (existingQuestions > 0) {
			console.log(`   ⏭️  ${skill.name} already has ${existingQuestions} questions`);
			skippedCount++;
			continue;
		}

		// create questions for this skill
		for (const q of questions) {
			await prisma.skillVerificationQuestion.create({
				data: {
					skillId: skill.id,
					questionText: q.questionText,
					difficultyLevel: q.difficultyLevel,
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

		console.log(`   ✅ created ${questions.length} questions for ${skill.name}`);
		createdCount++;
	}

	console.log(`\n🎉 completed! created questions for ${createdCount} skills, skipped ${skippedCount} skills`);
}

generateQuestions()
	.catch((e) => {
		console.error("❌ error generating questions:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
