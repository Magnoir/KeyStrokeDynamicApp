import { ref, set, get } from 'firebase/database';
import { db } from '$lib/firebase';
import { get_current_user } from '../../db/session';
import type { Cookies } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
	form: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;

		try {
			const submissionTimestamp = new Date().getTime();
			const timeStampref = ref(db, 'users/' + username + '/' + submissionTimestamp);
			const userData = Object.fromEntries(formData);
			await set(timeStampref, userData);
			return { success: true };
		} catch (error) {
			return { error: (error as Error).message };
		}
	}
};

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies }: { cookies: Cookies }) => {
	const sessionId = cookies.get('session_id');
	if (!sessionId) {
		throw new Error('Session ID is missing');
	}
	const username = await get_current_user(sessionId);
	const getDatabase = async () => {
		const rootRef = ref(db, `users/${username}/`);
		try {
			const snapshot = await get(rootRef);
			return snapshot.exists()
				? { data: snapshot.val() }
				: { error: 'No data available in the database', status: 404 };
		} catch (error) {
			return { error: (error as Error).message, status: 500 };
		}
	};

	const userDatabase = await getDatabase();
	return { props: { username }, userDatabase };
};
