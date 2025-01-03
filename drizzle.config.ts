import { defineConfig } from 'drizzle-kit';
// import { config } from 'process';
import { config } from './src/config.ts';
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.DATABASE_URL ?? '',
    host: "db",
    port: config.DATABASE_URL_DOCKER_PORT,
    database: "takeatest",
    user: "postgres",
    password: "00005",
  },
  verbose: true,
  strict: true,
});
