import { load } from 'https://deno.land/std@0.202.0/dotenv/mod.ts';
import z from 'npm:zod';

const env = await load();

const schema = z.object({
  PORT: z.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
  METRICS_PREFIX: z.string().default('app_'),
  COOKIE_NAME: z.string().default('session'),
});

export type Config = z.infer<typeof schema>;

export const config = schema.parse(env);
