import { json } from "@sveltejs/kit";
import { db } from "$lib/firebase";
import { ref, remove } from "firebase/database";
import { has_session } from "../../../db/session";
import type { RequestEvent } from "@sveltejs/kit";

export async function POST({ request, cookies }: RequestEvent) {
	try {
		const session_id = cookies.get("session_id");
		if (!session_id || !has_session(session_id)) {
			return json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await request.json();

		if (!id) {
			return json({ error: "Missing ID" }, { status: 400 });
		}

		const recordRef = ref(db, `users/${id}`);
		await remove(recordRef);

		return json({ success: true }, { status: 200 });
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
}