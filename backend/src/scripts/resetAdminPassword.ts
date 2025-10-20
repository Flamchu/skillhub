// script to reset admin password in supabase
// run with: yarn ts-node src/scripts/resetAdminPassword.ts

import { supabase } from "../config/supabase";
import { prisma } from "../config/database";
import * as dotenv from "dotenv";

dotenv.config();

const ADMIN_EMAIL = "root@flamchustudios.com";
const NEW_PASSWORD = "VerySecurePassword$1";

async function resetAdminPassword() {
	console.log("🔐 resetting admin password...\n");

	try {
		// check if admin exists in local database
		const localAdmin = await prisma.user.findFirst({
			where: { email: ADMIN_EMAIL },
		});

		if (!localAdmin) {
			console.error("❌ admin user not found in local database!");
			console.log("   run seed script first: yarn seed");
			process.exit(1);
		}

		console.log("✅ local admin found:");
		console.log("   email:", localAdmin.email);
		console.log("   name:", localAdmin.name);
		console.log("   role:", localAdmin.role);
		console.log("   supabase id:", localAdmin.supabaseId);
		console.log("");

		// check if user exists in supabase auth
		const {
			data: { users },
			error: listError,
		} = await supabase.auth.admin.listUsers();

		if (listError) {
			console.error("❌ failed to list supabase users:", listError.message);
			process.exit(1);
		}

		const supabaseUser = users.find((u) => u.email === ADMIN_EMAIL);

		if (!supabaseUser) {
			console.log("⚠️  admin user not found in supabase auth!");
			console.log("   creating new auth user...\n");

			// create user in supabase auth
			const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
				email: ADMIN_EMAIL,
				password: NEW_PASSWORD,
				email_confirm: true,
				user_metadata: {
					name: localAdmin.name,
					role: "ADMIN",
				},
			});

			if (createError) {
				console.error("❌ failed to create supabase user:", createError.message);
				process.exit(1);
			}

			if (!newUser.user) {
				console.error("❌ no user data returned");
				process.exit(1);
			}

			// update local user with supabase id
			await prisma.user.update({
				where: { id: localAdmin.id },
				data: { supabaseId: newUser.user.id },
			});

			console.log("✅ supabase auth user created successfully!");
			console.log("   supabase id:", newUser.user.id);
		} else {
			console.log("✅ supabase auth user found:");
			console.log("   email:", supabaseUser.email);
			console.log("   id:", supabaseUser.id);
			console.log("   email confirmed:", supabaseUser.email_confirmed_at ? "yes" : "no");
			console.log("");

			// update password
			console.log("🔄 updating password...");
			const { error: updateError } = await supabase.auth.admin.updateUserById(supabaseUser.id, {
				password: NEW_PASSWORD,
				email_confirm: true,
			});

			if (updateError) {
				console.error("❌ failed to update password:", updateError.message);
				process.exit(1);
			}

			console.log("✅ password updated successfully!");

			// update local database supabase id if different
			if (localAdmin.supabaseId !== supabaseUser.id) {
				await prisma.user.update({
					where: { id: localAdmin.id },
					data: { supabaseId: supabaseUser.id },
				});
				console.log("✅ local database supabase id updated");
			}
		}

		console.log("\n🎉 admin password reset complete!");
		console.log("\n📋 login credentials:");
		console.log("   email:", ADMIN_EMAIL);
		console.log("   password:", NEW_PASSWORD);
		console.log("\n⚠️  change password after first login!");
	} catch (error: any) {
		console.error("\n❌ error:", error.message);
		console.error(error);
		process.exit(1);
	}
}

resetAdminPassword()
	.catch((e) => {
		console.error("❌ unhandled error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
