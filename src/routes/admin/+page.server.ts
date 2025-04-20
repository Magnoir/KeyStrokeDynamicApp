import { get_all_users } from '$lib/db/session'; // Import function to fetch all users from the database
import { redirect } from '@sveltejs/kit'; // Import redirect utility from SvelteKit
import type { Cookies } from '@sveltejs/kit'; // Import type definition for Cookies
import { get_user_status } from '$lib/db/session'; // Import function to get the user's status

/** @type {import('./$types').PageServerLoad} */
// Define the `load` function to handle server-side data loading
export const load = async ({ cookies }: { cookies: Cookies }) => {
	const session_id = cookies.get('session_id'); // Retrieve the session ID from cookies
	if (!session_id) throw redirect(303, '/login'); // Redirect to login if session ID is missing

	const status = await get_user_status(session_id); // Check the user's status using the session ID
	if (status !== 1) throw redirect(303, '/home'); // Redirect to home if the user is not an admin (status !== 1)

	const users = await get_all_users(); // Fetch all users from the database
	return { users }; // Return the list of users to the page
};
