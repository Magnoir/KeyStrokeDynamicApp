import { redirect } from '@sveltejs/kit';
import { has_session, get_user_status } from '../db/session';
import type { Cookies } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies, url }: { cookies: Cookies; url: URL }) => {
	const session_id = cookies.get('session_id');
	const logged_in = session_id && (await has_session(session_id));
	let user_status = null;

	if (logged_in) {
		user_status = await get_user_status(session_id);
	}

	if (!logged_in && url.pathname !== '/login' && url.pathname !== '/signup') {
		throw redirect(307, '/login');
	}

	if (
		logged_in &&
		user_status !== 1 &&
		(url.pathname === '/database' || url.pathname === '/admin')
	) {
		throw redirect(303, '/home');
	}

	if (logged_in && user_status === 0 && url.pathname !== '/home') {
		throw redirect(303, '/home');
	}

	return { logged_in, user_status };
};
