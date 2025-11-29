import { db } from "../client";
import { sessions } from "../schema";

export async function saveSession(title: string) {
    const [session] = await db
        .insert(sessions)
        .values({ title })
        .returning({ id: sessions.id });

    if (!session) {
        throw new Error(
            `(Save Session) Database Insert error - ${sessions} table`,
        );
    }
    return session.id;
}
