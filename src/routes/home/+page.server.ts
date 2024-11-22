import { ref, set, get } from "firebase/database";
import { db } from "$lib/firebase";

/** @type {import('./$types').Actions} */
export const actions = {
    default: async ({ request }: { request: Request }) => {
        const formData = await request.formData();
        const username = formData.get("username");

        try {
            const userRef = ref(db, "users/" + username);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                return { error: "Username already exists" };
            } 

            const userData = Object.fromEntries(formData);
            await set(userRef, userData);
            return { success: true };
        } catch (error) {
            return { error: (error as any).message };
        }
    },
};
