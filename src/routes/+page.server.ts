import { delete_session } from '$lib/db/session';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
	logout: async ({ cookies }) => {
		const session_id = cookies.get('session_id');

		if (session_id) {
			delete_session(session_id);
			cookies.delete('session_id', { path: '/' });
		}

		throw redirect(303, '/login');
	}
};
