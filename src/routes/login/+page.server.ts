import type { Actions } from "./$types";
import { SECRET_USERNAME, SECRET_PASSWORD } from "$env/static/private";
import { fail, redirect } from "@sveltejs/kit";
import { save_session } from "../../db/session";

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get("username");
		const password = data.get("password");
		
		const username_correct = username === SECRET_USERNAME;
		const password_correct = password === SECRET_PASSWORD;

		if (username_correct && password_correct) {
			const session_id = save_session();
			const one_hour = 60 * 60;
			cookies.set("session_id", session_id, {
				path: "/",
				maxAge: one_hour,
			});

			throw redirect(303, "/home");
		}
		return fail(401, { password_correct });
	},
};