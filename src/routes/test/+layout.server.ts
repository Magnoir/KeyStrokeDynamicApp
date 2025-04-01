import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { has_session } from '../../db/session';
import type { Cookies } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }: { cookies: Cookies }) => {
	const session_id = cookies.get('session_id');
	if (!session_id) throw redirect(307, '/login');
	const logged_in = await has_session(session_id);
	if (!logged_in) throw redirect(307, '/login');
};
