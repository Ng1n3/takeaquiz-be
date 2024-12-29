import z from 'zod';

const schema = z.object({
  PORT: z.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
  METRICS_PREFIX: z.string().default('app_'),
  COOKIE_NAME: z.string().default('session'),
});

export type Config = z.infer<typeof schema>;

export const config = schema.parse({
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  HOST: process.env.HOST ?? '0.0.0.0',
  DATABASE_URL: process.env.DATABASE_URL,
  LOG_LEVEL:  'info',
  METRICS_PREFIX: 'app_',
  COOKIE_NAME: process.env.COOKIE_NAME,
});