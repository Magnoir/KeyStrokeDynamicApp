import { URL_AWS_API } from '$env/static/private';
import type { KeyDataEntry } from '$lib/types/KeyDataEntry';
import {
	processKeyDataToDataFrame,
	calculateHighestScore
} from '$lib/functions/testProcessingResult';

/** @type {import('./$types').Actions} */
export const actions = {
	aws: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const model = formData.get('model') as string;
		const userData = JSON.parse(formData.get(`keyData-${model}`) as string) as Record<
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
