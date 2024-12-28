import { defineConfig } from 'npm:drizzle-kit';
import { config } from './src/config.ts';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.DATABASE_URL ?? '',
  },
});
