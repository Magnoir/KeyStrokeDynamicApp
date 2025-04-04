import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { ref, get } from 'firebase/database';
import { db } from '$lib/firebase';
import { compare } from 'bcrypt';
import { save_session } from '$lib/db/session';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username') as string;
		const password = data.get('password') as string;

		if (!username) {
			return fail(400, { error: 'Username is required' });
		}
		if (!password) {
			return fail(400, { error: 'Password is required' });
		}

		const userRef = ref(db, `authentication/${username}`);
		const snapshot = await get(userRef);

		if (!snapshot.exists()) {
			return fail(401, { error: 'Invalid username or password' });
		}

		const storedData = snapshot.val();
		const passwordCorrect = await compare(password, storedData.password);

		if (!passwordCorrect) {
			return fail(401, { error: 'Invalid username or password' });
		}

		const one_hour = 60 * 60;
		const session_id = save_session(username, storedData.status);
		cookies.set('session_id', session_id, {
			path: '/',
			maxAge: one_hour
		});

		throw redirect(303, '/home');
	}
};
