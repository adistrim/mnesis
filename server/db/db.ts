import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { settings } from "@/config/settings";

const client = postgres(settings.DB_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
});

export const db = drizzle(client);
