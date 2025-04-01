import { ref, get, set, remove } from 'firebase/database';
import { db } from '$lib/firebase';

export function save_session(username: string, status: number): string {
	const session_id = crypto.randomUUID();
	const sessionRef = ref(db, `sessions/${session_id}`);
	set(sessionRef, { username, status });
	return session_id;
}

export async function has_session(session_id: string): Promise<boolean> {
	const sessionRef = ref(db, `sessions/${session_id}`);
	const snapshot = await get(sessionRef);
	return snapshot.exists();
}

export async function delete_session(session_id: string): Promise<void> {
	const sessionRef = ref(db, `sessions/${session_id}`);
	await remove(sessionRef);
}

export async function get_user_status(session_id: string): Promise<number | null> {
	const userRef = ref(db, `sessions/${session_id}`);
	const snapshot = await get(userRef);
	if (snapshot.exists()) {
		return snapshot.val().status || null;
	}
	return null;
}

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

export async function get_current_user(session_id: string) {
	const userRef = ref(db, `sessions/${session_id}`);
	const snapshot = await get(userRef);
	if (snapshot.exists()) {
		return snapshot.val().username;
	}
	return null;
}
