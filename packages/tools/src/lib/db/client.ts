import { Database } from 'bun:sqlite';
import { DB_PATH } from '../../config';

const dbClient = new Database(DB_PATH);

export default dbClient;
