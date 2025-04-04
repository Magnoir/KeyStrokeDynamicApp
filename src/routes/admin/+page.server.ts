import { get_all_users } from '$lib/db/session';
import { redirect } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import { get_user_status } from '$lib/db/session';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies }: { cookies: Cookies }) => {
	const session_id = cookies.get('session_id');
	if (!session_id) throw redirect(303, '/login');

	const status = await get_user_status(session_id);
	if (status !== 1) throw redirect(303, '/home');
	const users = await get_all_users();
	return { users };
};
