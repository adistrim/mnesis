import { settings } from "@/config/settings";
import { SQL } from "bun";

let dbClient: SQL | null = null;

function createDbClient(): SQL {
    return new SQL(settings.DB_URL);
}

export default function getDbClient(): SQL {
    if (!dbClient) {
        dbClient = createDbClient();
    }
    return dbClient;
}
