import { settings } from "@/config/settings";
import { SQL } from "bun";

const db_client = new SQL(settings.DB_URL);

export default db_client;
