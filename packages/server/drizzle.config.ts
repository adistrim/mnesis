import type { Config } from 'drizzle-kit';
import { settings } from './src/config/settings';

export default {
  schema: './src/db/schema/',
  out: './drizzle',
  strict: true,
  dialect: 'postgresql',
  dbCredentials: {
    url: settings.DB_URL
  }
} satisfies Config;
