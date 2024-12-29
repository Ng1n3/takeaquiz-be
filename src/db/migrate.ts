import { migrate } from 'drizzle-orm/postgres-js/migrator';
// import postgres from 'postgres';
import { config } from '../config.ts';

async function run() {
  try {
    // First connect to 'postgres' database to create our database if needed
    // const initialClient = postgres(
    //   config.DATABASE_URL!.replace('/takeatest', '/postgres')
    // );

    console.log("FUCK I'm HIT!!!");

    // Create database if it doesn't exist
    // await initialClient`
    //     CREATE DATABASE takeatest
    //     WITH 
    //     OWNER = postgres
    //     ENCODING = 'UTF8'
    //     CONNECTION LIMIT = -1;
    //   `;

    // await initialClient.end();
    const { setupDb } = await import('./index.ts');
    const { db, client } = await setupDb(config.DATABASE_URL);

    console.log('Starting migration...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migration completed successfully');

    //Proper cleanup
    await client.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
