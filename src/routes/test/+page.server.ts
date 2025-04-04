import { ref, get } from 'firebase/database';
import { db } from '$lib/firebase';
import { get_current_user } from '$lib/db/session';
import type { Cookies } from '@sveltejs/kit';
import { URL_AWS_API } from '$env/static/private';
import type { KeyDataEntry } from '$lib/types/KeyDataEntry';
import{ processKeyDataToDataFrame, calculateHighestScore } from '$lib/functions/testProcessingResult';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies }: { cookies: Cookies }) => {
	const sessionId = cookies.get('session_id');
	if (!sessionId) {
		throw new Error('Session ID is missing');
	}
	const username = await get_current_user(sessionId);
	const getDatabase = async () => {
		const rootRef = ref(db, `users/${username}/`);
		try {
			const snapshot = await get(rootRef);
			return snapshot.exists()
				? { data: snapshot.val() }
				: { error: 'No data available in the database', status: 404 };
		} catch (error) {
			return { error: (error as Error).message, status: 500 };
		}
	};

	const userDatabase = await getDatabase();
	return { props: { username }, userDatabase };
};

/** @type {import('./$types').Actions} */
export const actions = {
	aws: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const userData = JSON.parse(formData.get('keyData') as string) as Record<
			string,
			KeyDataEntry[]
		>;
		const url = URL_AWS_API;
		const processdata = processKeyDataToDataFrame(userData);
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				tables: processdata
			})
		});

		// Lire la réponse en JSON
		const response = await res.json();
		const result = JSON.parse(response.body).predictions;

		return { success: true, result: calculateHighestScore(result) };
	}
};
