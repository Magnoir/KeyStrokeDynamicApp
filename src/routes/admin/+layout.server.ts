import { redirect } from '@sveltejs/kit';
import { get_user_status } from '../../db/session';

export const load = async ({ cookies }) => {
	const session_id = cookies.get('session_id');
	if (!session_id) throw redirect(303, '/login');

	const status = await get_user_status(session_id);
	if (status !== 1) throw redirect(303, '/home');
};
