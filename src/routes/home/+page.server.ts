import { ref, set } from "firebase/database";
import { db } from "$lib/firebase";
import { get_current_user } from "../../db/session";

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

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ cookies }: { cookies: any }) => {
    const username = await get_current_user(cookies.get("session_id"));
    return { props: { username } };
};