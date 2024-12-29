import { defineConfig } from 'drizzle-kit';
import { config } from './src/config.ts';
console.log("Fuck I'm HIT!!");
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.DATABASE_URL ?? '',
  },
});
