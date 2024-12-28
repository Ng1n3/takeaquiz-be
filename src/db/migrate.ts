import { migrate } from 'npm:drizzle-orm/postgres-js/migrator';
import { config } from '../config.ts';

async function run() {
  const { setupDb } = await import('./index.ts');
  const { db, client } = await setupDb(config.DATABASE_URL);
  await migrate(db, { migrationsFolder: './migrations' });
  await client.end;
}

run();
