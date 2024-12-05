import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { save_session } from "../../db/session";
import { ref, set, get } from "firebase/database";
import { db } from "$lib/firebase";
import { genSalt, hash } from "bcrypt";

const SALT_ROUNDS = 10;

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get("username") as string;
		const password = data.get("password1") as string;

		if (!username) return fail(400, { error: "Username is required" });
		if (!password) return fail(400, { error: "Password is required" });

		const authentificationRef = ref(db, `authentication/${username}`);
		try {
			const snapshot = await get(authentificationRef);
			if (snapshot.exists()) {
				return fail(400, { error: "Username already exists" });
			}
		} catch (error: any) {
			console.error("Error fetching Firebase data:", error);
			return fail(500, { error: "Internal server error" });
		}

		try {
			const salt = await genSalt(SALT_ROUNDS);
			const hashedPassword = await hash(password, salt);

			const userRef = ref(db, `authentication/${username}`);
			await set(userRef, { password: hashedPassword, status: 0 });
		} catch (error: any) {
			console.error("Error during user creation:", error);
			return fail(500, { error: "Failed to create user" });
		}

		const session_id = save_session(username, 0);
		const one_hour = 60 * 60;
		cookies.set("session_id", session_id, {
			path: "/",
			maxAge: one_hour,
		});

		throw redirect(303, "/home");
	},
};