import { migrate } from 'npm:drizzle-orm/postgres-js/migrator';
import { config } from '../config.ts';

async function run() {
  try {
    const { setupDb } = await import('./index.ts');
    const { db, client } = await setupDb(config.DATABASE_URL);

    console.log('Starting migration...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migration completed successfully');

    //Proper cleanup
    await client.end;
  } catch (error) {
    console.error('Migration failed:', error);
    Deno.exit(1);
  }
}

run();
