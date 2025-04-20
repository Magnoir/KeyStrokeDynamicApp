import { db } from '$lib/firebase';
import { ref, get } from 'firebase/database';
import { has_session } from '$lib/db/session';
import type { Cookies } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({
	parent,
	cookies
}: {
	parent: () => Promise<void>;
	cookies: Cookies;
}) => {
	const session_id = cookies.get('session_id');
	if (!session_id) throw redirect(307, '/login');
	const logged_in = await has_session(session_id);
	if (!logged_in) throw redirect(307, '/login');
	await parent();

	const getDatabase = async (folder: string) => {
		const rootRef = ref(db, folder + '/');
		try {
			const snapshot = await get(rootRef);
			return snapshot.exists()
				? { data: snapshot.val() }
				: { error: 'No data available in the database', status: 404 };
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
			return { error: errorMessage, status: 500 };
		}
	};

	const usersDatabase = await getDatabase('users');
	const signupsDatabase = await getDatabase('signup');
	const signupnewDatabase = await getDatabase('signupnew');
	return { usersDatabase, signupsDatabase, signupnewDatabase };
};
