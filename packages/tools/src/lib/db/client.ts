import { Database } from 'bun:sqlite';
import { DB_PATH } from '../../config';

let dbClient: Database | null = null;

export function getDbClient(): Database {
  if (!dbClient) {
    dbClient = new Database(DB_PATH);
  }

  return dbClient;
}
