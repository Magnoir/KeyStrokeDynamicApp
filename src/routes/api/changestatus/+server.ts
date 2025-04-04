import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase';
import { ref, update, get } from 'firebase/database';
import { has_session } from '$lib/db/session';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request, cookies }: RequestEvent) {
	try {
		const session_id = cookies.get('session_id');
		if (!session_id || !(await has_session(session_id))) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { username, status } = await request.json();

		if (!username) {
			return json({ error: 'Missing username' }, { status: 400 });
		}

		if (status === undefined || typeof status !== 'number') {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		const userRef = ref(db, `authentication/${username}`);
		await update(userRef, { status });

		const sessionsRef = ref(db, `sessions`);
		const snapshot = await get(sessionsRef);

		if (snapshot.exists()) {
			const sessions = snapshot.val();
			for (const sessionId in sessions) {
				if (sessions[sessionId].username === username) {
					const sessionRef = ref(db, `sessions/${sessionId}`);
					await update(sessionRef, { status });
				}
			}
		}

		return json({ success: true }, { status: 200 });
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('Error updating user status:', error.message);
		} else {
			console.error('Error updating user status:', error);
			return json(
				{ error: error instanceof Error ? error.message : 'Unknown error' },
				{ status: 500 }
			);
		}
	}
}
