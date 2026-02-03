import { settings } from "@/config/settings";
import { SQL } from "bun";

let db_client: SQL | null = null;

export default function getDbClient(): SQL {
    if (!db_client) {
        db_client = new SQL(settings.DB_URL);
    }
    return db_client;
}
