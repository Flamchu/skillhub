// Quick test for enum usage
const { z } = require("zod");

// Simulate the enum structure we expect from Prisma
const Role = {
	USER: "USER",
	INSTRUCTOR: "INSTRUCTOR",
	ADMIN: "ADMIN",
};

// Test if z.enum works with object
try {
	const schema = z.enum(Role);
	console.log("z.enum(Role) works - object approach");
} catch (e) {
	console.log("z.enum(Role) failed:", e.message);
}

// Test if z.enum works with Object.values()
try {
	const schema2 = z.enum(Object.values(Role));
	console.log("z.enum(Object.values(Role)) works - array approach");
} catch (e) {
	console.log("z.enum(Object.values(Role)) failed:", e.message);
}
