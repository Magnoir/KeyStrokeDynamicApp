import type { KeyDataEntry } from '$lib/types/KeyDataEntry';
import type { ProcessedRow } from '$lib/types/ProcessedRow';

/**
 * Calculates the user with the highest score based on a series of ranked predictions.
 * Each prediction entry contains an array of user IDs ranked from highest to lowest.
 * Scores are assigned based on the rank: 3 points for the first user, 2 points for the second, 
 * and 1 point for the third. The function aggregates scores for each user across all predictions.
 * 
 * @param predictionsentry - A 2D array where each inner array represents a ranked list of user IDs.
 * @returns The user ID with the highest score. If there is a tie, the first user in the tie is returned.
 *          Returns `null` if no users are present in the predictions.
 */
export function calculateHighestScore(predictionsentry: string[][]): string | null {
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

/**
 * Processes a record of key data entries into a structured data frame.
 *
 * @param items - A record where the keys are strings and the values are arrays of `KeyDataEntry` objects.
 *                Each `KeyDataEntry` represents a key event with associated timestamps and key information.
 * 
 * @returns An array of `ProcessedRow` objects, where each row contains calculated metrics and key pair information.
 * 
 * The function performs the following steps:
 * - Iterates over the provided `items` object.
 * - For each array of `KeyDataEntry`, calculates various timing metrics:
 *   - `keydownTime`: The duration of a key being held down.
 *   - `UD`: The time between a key being released and the next key being pressed.
 *   - `DD`: The time between consecutive key presses.
 *   - `DU`: The time between a key press and the next key release.
 *   - `UU`: The time between consecutive key releases.
 * - Extracts the key values for each entry.
 * - Constructs rows of processed data, each containing the calculated metrics and key pair information.
 * 
 * Each row in the resulting array includes:
 * - `keydownTime`: The duration of the key press in seconds (rounded to 3 decimal places).
 * - `UD`: The time between key release and the next key press in seconds (rounded to 3 decimal places).
 * - `DD`: The time between consecutive key presses in seconds (rounded to 3 decimal places).
 * - `DU`: The time between a key press and the next key release in seconds (rounded to 3 decimal places).
 * - `UU`: The time between consecutive key releases in seconds (rounded to 3 decimal places).
 * - `key1`: The current key in the sequence.
 * - `key2`: The next key in the sequence (or `null` if there is no next key).
 */
export function processKeyDataToDataFrame(items: Record<string, KeyDataEntry[]>): ProcessedRow[] {
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
