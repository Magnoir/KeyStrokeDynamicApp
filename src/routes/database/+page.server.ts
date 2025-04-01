import { db } from '$lib/firebase';
import { ref, get } from 'firebase/database';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ parent }: { parent: () => Promise<void> }) => {
	await parent();

	const getDatabase = async () => {
		const rootRef = ref(db, 'users/');
		try {
			const snapshot = await get(rootRef);
			return snapshot.exists()
				? { data: snapshot.val() }
				: { error: 'No data available in the database', status: 404 };
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
			return { error: errorMessage, status: 500 };
		}
	};

	const database = await getDatabase();
	return { database };
};
