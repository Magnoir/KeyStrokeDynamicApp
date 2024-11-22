import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }: { parent: () => Promise<void> }) => {
	await parent();
};