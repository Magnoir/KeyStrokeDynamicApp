import { get_all_users } from '../../db/session';

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	const users = await get_all_users();
	return { users };
};
