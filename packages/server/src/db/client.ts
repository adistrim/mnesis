import { settings } from "@/config/settings";
import { SQL } from "bun";

class DatabaseClient {
    private static instance: SQL | null = null;

    static getInstance(): SQL {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new SQL(settings.DB_URL);
        }
        return DatabaseClient.instance;
    }
}

export default DatabaseClient.getInstance;
