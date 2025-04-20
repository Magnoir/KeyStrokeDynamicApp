import { json } from '@sveltejs/kit'; // Importing the json helper for returning JSON responses.
import { db } from '$lib/firebase'; // Importing the Firebase database instance.
import { ref, remove } from 'firebase/database'; // Importing Firebase database functions for referencing and removing data.
import { has_session } from '$lib/db/session'; // Importing a helper function to check session validity.
import type { RequestEvent } from '@sveltejs/kit'; // Importing the type for the request event.

export async function POST({ request, cookies }: RequestEvent) {
	try {
		// Retrieve the session ID from cookies.
		const session_id = cookies.get('session_id');
		// Check if the session ID exists and is valid.
		if (!session_id || !(await has_session(session_id))) {
			// Return a 401 Unauthorized response if the session is invalid.
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Parse the request body to extract the ID and username.
		const { id, username } = await request.json();

		// Check if the ID is provided in the request body.
		if (!id) {
			// Return a 400 Bad Request response if the ID is missing.
			return json({ error: 'Missing ID' }, { status: 400 });
		}

		// Create a reference to the specific record in the Firebase database.
		const recordRef = ref(db, `users/${username}/${id}`);
		// Remove the record from the database.
		await remove(recordRef);

		// Return a 200 OK response indicating success.
		return json({ success: true }, { status: 200 });
	} catch (error: unknown) {
		// Handle any errors that occur during the process.
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		// Return a 500 Internal Server Error response with the error message.
		return json({ error: errorMessage }, { status: 500 });
	}
}
