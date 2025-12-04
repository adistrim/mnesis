import { AppError, databaseError } from "@/lib/errors";
import { db } from "../client";
import { sessions } from "../schema";

export async function saveSession(title: string) {
    try {
        const [session] = await db
            .insert(sessions)
            .values({ title })
            .returning({ id: sessions.id });

        if (!session) {
            throw databaseError("Failed to create session");
        }
        return session.id;
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error("Database error in saveSession:", error);
        throw databaseError("Failed to create session");
    }
}
