import { ref, set } from "firebase/database";
import { db } from "$lib/firebase";

/** @type {import('./$types').Actions} */
export const actions = {
    default: async ({ request }: { request: Request }) => {
        const formData = await request.formData();
        const username = formData.get("username");

        try {
            const submissionTimestamp = new Date().getTime();
            const timeStampref = ref(db, "users/" + username + "/" + submissionTimestamp);
            const userData = Object.fromEntries(formData);
            await set(timeStampref, userData);
            return { success: true };
        } catch (error) {
            return { error: (error as any).message };
        }
    },
};
