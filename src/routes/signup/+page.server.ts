import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { ref, set, get } from 'firebase/database';
import { db } from '$lib/firebase';
import { genSalt, hash } from 'bcrypt';

const SALT_ROUNDS = 10;

export const actions: Actions = {
	signup: async ({ request }) => {
		const data = await request.formData();
		const keyData = data.get('keyData') as string;
		const username = data.get('username') as string;
		const password = data.get('password') as string;

		if (!username) return fail(400, { error: 'Username is required' });
		if (!password) return fail(400, { error: 'Password is required' });
		const authentificationRef = ref(db, `authentication/${username}`);
		try {
			const snapshot = await get(authentificationRef);
			if (snapshot.exists()) {
				return fail(400, { error: 'Username already exists' });
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error('Error fetching Firebase data:', error.message);
			} else {
				console.error('Error fetching Firebase data:', error);
			}
			return fail(500, { error: 'Internal server error' });
		}
		try {
			const salt = await genSalt(SALT_ROUNDS);
			const hashedPassword = await hash(password, salt);

			const userRef = ref(db, `authentication/${username}`);
			await set(userRef, { password: hashedPassword, status: 0 });
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error('Error fetching Firebase data:', error.message);
			} else {
				console.error('Error fetching Firebase data:', error);
			}
			return fail(500, { error: 'Internal server error' });
		}
		try {
			const userData = ref(db, `signup/${username}`);
			await set(userData, JSON.parse(keyData));

		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error('Error fetching Firebase data:', error.message);
			} else {
				console.error('Error fetching Firebase data:', error);
			}
			return fail(500, { error: 'Internal server error' });
		}

		throw redirect(303, '/login');
	}
};
