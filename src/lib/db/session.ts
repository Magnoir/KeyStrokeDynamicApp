import { ref, get, set, remove } from 'firebase/database';
import { db } from '$lib/firebase';

/**
 * Saves a user session to the database with a unique session ID.
 *
 * @param username - The username of the user whose session is being saved.
 * @param status - The status of the session, represented as a number.
 * @returns A string representing the unique session ID.
 */
export function save_session(username: string, status: number): string {
	const session_id = crypto.randomUUID();
	const sessionRef = ref(db, `sessions/${session_id}`);
	set(sessionRef, { username, status });
	return session_id;
}

/**
 * Checks if a session with the given session ID exists in the database.
 *
 * @param session_id - The unique identifier of the session to check.
 * @returns A promise that resolves to `true` if the session exists, or `false` otherwise.
 */
export async function has_session(session_id: string): Promise<boolean> {
	const sessionRef = ref(db, `sessions/${session_id}`);
	const snapshot = await get(sessionRef);
	return snapshot.exists();
}

/**
 * Deletes a session from the database.
 *
 * @param session_id - The unique identifier of the session to be deleted.
 * @returns A promise that resolves when the session is successfully removed.
 */
export async function delete_session(session_id: string): Promise<void> {
	const sessionRef = ref(db, `sessions/${session_id}`);
	await remove(sessionRef);
}

/**
 * Retrieves the status of a user associated with a given session ID from the database.
 *
 * @param session_id - The unique identifier of the session.
 * @returns A promise that resolves to the user's status as a number if it exists, or `null` if the session does not exist or the status is not defined.
 */
export async function get_user_status(session_id: string): Promise<number | null> {
	const userRef = ref(db, `sessions/${session_id}`);
	const snapshot = await get(userRef);
	if (snapshot.exists()) {
		return snapshot.val().status || null;
	}
	return null;
}

/**
 * Retrieves all users from the 'authentication' database reference.
 *
 * This function fetches the data from the specified database reference,
 * checks if the snapshot exists, and then processes the data to return
 * a filtered object containing user information.
 *
 * @returns A promise that resolves to an object where each key is a username
 *          and the value is an object containing the user's data. If no data
 *          exists, an empty object is returned.
 */
export async function get_all_users() {
	const usersRef = ref(db, 'authentication');
	const snapshot = await get(usersRef);
	if (snapshot.exists()) {
		const users = snapshot.val();
		const filteredUsers = Object.keys(users).reduce(
			(result, username) => {
				const { ...userData } = users[username];
				result[username] = userData;
				return result;
			},
			{} as Record<string, { [key: string]: unknown }>
		);

		return filteredUsers;
	}
	return {};
}

/**
 * Retrieves the username of the current user associated with the given session ID.
 *
 * @param session_id - The unique identifier for the user's session.
 * @returns A promise that resolves to the username if the session exists, or `null` if it does not.
 */
export async function get_current_user(session_id: string) {
	const userRef = ref(db, `sessions/${session_id}`);
	const snapshot = await get(userRef);
	if (snapshot.exists()) {
		return snapshot.val().username;
	}
	return null;
}
