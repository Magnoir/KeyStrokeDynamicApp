import { json } from '@sveltejs/kit';
import { db } from '$lib/firebase';
import { ref, update, get } from 'firebase/database';
import { has_session } from '$lib/db/session';
import type { RequestEvent } from '@sveltejs/kit';

// This function handles POST requests to update a user's status in the database.
export async function POST({ request, cookies }: RequestEvent) {
	try {
		// Retrieve the session ID from cookies and validate the session.
		const session_id = cookies.get('session_id');
		if (!session_id || !(await has_session(session_id))) {
			// If the session is invalid or missing, return an unauthorized error.
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Parse the request body to extract the username and status.
		const { username, status } = await request.json();

		// Validate the presence of the username.
		if (!username) {
			return json({ error: 'Missing username' }, { status: 400 });
		}

		// Validate the status value (must be a number and not undefined).
		if (status === undefined || typeof status !== 'number') {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		// Update the user's status in the `authentication` node of the database.
		const userRef = ref(db, `authentication/${username}`);
		await update(userRef, { status });

		// Retrieve all active sessions from the `sessions` node of the database.
		const sessionsRef = ref(db, `sessions`);
		const snapshot = await get(sessionsRef);

		// If sessions exist, iterate through them to update the status for the user's sessions.
		if (snapshot.exists()) {
			const sessions = snapshot.val();
			for (const sessionId in sessions) {
				if (sessions[sessionId].username === username) {
					// Update the status for each session associated with the username.
					const sessionRef = ref(db, `sessions/${sessionId}`);
					await update(sessionRef, { status });
				}
			}
		}

		// Return a success response if all updates are completed.
		return json({ success: true }, { status: 200 });
	} catch (error: unknown) {
		// Handle errors and log them for debugging purposes.
		if (error instanceof Error) {
			console.error('Error updating user status:', error.message);
		} else {
			console.error('Error updating user status:', error);
		}

		// Return a generic error response if something goes wrong.
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
