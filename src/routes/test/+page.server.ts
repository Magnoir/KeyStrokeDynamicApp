import { ref, get } from 'firebase/database';
import { db } from '$lib/firebase';
import { get_current_user } from '$lib/db/session';
import type { Cookies } from '@sveltejs/kit';
import { URL_AWS_API } from '$env/static/private';

interface KeyDataEntry {
	keyDownTimestamp: number;
	keyUpTimestamp: number;
	key?: string;
}

interface ProcessedRow {
	keydownTime: number | null;
	UD: number | null;
	DD: number | null;
	UU: number | null;
	DU: number | null;
	iteration: number;
	key1: string;
	key2: string | null;
}

function calculateHighestScore(predictionsentry: string[][]): string | null {
	// Init the dictionary
	const userScores: Record<string, number> = {};

	// Gives scores (weight) depending on the user's rank
	for (const prediction of predictionsentry) {
		// First user gets 3, second gets 2, third gets 1
		const scores = [3, 2, 1];
		for (let i = 0; i < prediction.length; i++) {
			const user = prediction[i];
			if (userScores[user]) {
				userScores[user] += scores[i];
			} else {
				userScores[user] = scores[i];
			}
		}
	}

	// Find the user with the highest score
	let maxScore = -1;
	let topUsers: string[] = [];
	for (const user in userScores) {
		const score = userScores[user];
		if (score > maxScore) {
			maxScore = score;
			topUsers = [user];
		} else if (score === maxScore) {
			topUsers.push(user);
		}
	}

	// Return the user with the highest score. If there's a tie, return the first.
	return topUsers.length > 0 ? topUsers[0] : null;
}

function processKeyDataToDataFrame(items: Record<string, KeyDataEntry[]>): ProcessedRow[] {
	const rows: ProcessedRow[] = [];

	for (const [, subSubItems] of Object.entries(items)) {
		const keyData = subSubItems as KeyDataEntry[];

		if (!keyData || keyData.length === 0) continue; // Sauter si keyData est vide

		// Calcul des metrics
		const keyDownTimes = keyData.map((entry) => {
			if (entry.keyDownTimestamp && entry.keyUpTimestamp) {
				return roundToDecimal((entry.keyUpTimestamp - entry.keyDownTimestamp) * 0.001, 3);
			}
			return null;
		});

		const keyUpDown = keyData.slice(1).map((_, index) => {
			if (keyData[index].keyUpTimestamp && keyData[index + 1].keyDownTimestamp) {
				return roundToDecimal(
					(keyData[index + 1].keyDownTimestamp - keyData[index].keyUpTimestamp) * 0.001,
					3
				);
			}
			return null;
		});

		const keyDownDown = keyData.slice(1).map((_, index) => {
			if (keyData[index].keyDownTimestamp && keyData[index + 1].keyDownTimestamp) {
				return roundToDecimal(
					(keyData[index + 1].keyDownTimestamp - keyData[index].keyDownTimestamp) * 0.001,
					3
				);
			}
			return null;
		});

		const keyUpUp = keyData.slice(1).map((_, index) => {
			if (keyData[index].keyUpTimestamp && keyData[index + 1].keyUpTimestamp) {
				return roundToDecimal(
					(keyData[index + 1].keyUpTimestamp - keyData[index].keyUpTimestamp) * 0.001,
					3
				);
			}
			return null;
		});

		const keyDownUp = keyData.slice(1).map((_, index) => {
			if (keyData[index].keyDownTimestamp && keyData[index + 1].keyUpTimestamp) {
				return roundToDecimal(
					(keyData[index + 1].keyUpTimestamp - keyData[index].keyDownTimestamp) * 0.001,
					3
				);
			}
			return null;
		});

		const keys = keyData.map((entry) => entry.key || 'null');

		// Ajout des données dans une liste de lignes
		for (let iteration = 0; iteration < keyDownTimes.length - 1; iteration++) {
			rows.push({
				keydownTime: keyDownTimes[iteration],
				UD: keyUpDown[iteration],
				DD: keyDownDown[iteration],
				DU: keyDownUp[iteration],
				UU: keyUpUp[iteration],
				iteration: iteration + 1,
				key1: keys[iteration],
				key2: keys[iteration + 1] || null
			});
		}
	}

	return rows;
}

// Fonction utilitaire pour arrondir à un certain nombre de décimales
function roundToDecimal(value: number, decimals: number): number {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}

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
