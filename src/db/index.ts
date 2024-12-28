import { sql } from 'npm:drizzle-orm';
import { drizzle } from 'npm:drizzle-orm/postgres-js';
import postgres from 'npm:postgres';
import { config } from '../config.ts';
import * as schema from './schema.ts';

export function setupDb(url: string | undefined = config.DATABASE_URL) {
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = postgres(url, {});

  const db = drizzle(client, { schema });

  return { client, db };
}

export function ping(db: DB) {
  return db.execute(sql`SELECT 1`);
}

export type DB = Awaited<ReturnType<typeof setupDb>>['db'];

export type Client = Awaited<ReturnType<typeof setupDb>>['client'];

export function teardownDb(client: Client) {
  client.end;
}
