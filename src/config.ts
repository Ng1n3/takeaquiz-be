import z from 'zod';

const schema = z.object({
  PORT: z.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
  METRICS_PREFIX: z.string().default('app_'),
  SALT_WORK_FACTOR: z.string(),
  PUBLIC_KEY: z.string(),
  ACCESS_TOKEN_TTL: z.string(),
  REFRESH_TOKEN_TTL: z.string(),
  PRIVATE_KEY: z.string(),
});

export type Config = z.infer<typeof schema>;

export const config = schema.parse({
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  HOST: process.env.HOST ?? '0.0.0.0',
  // DATABASE_URL: process.env.DATABASE_URL || process.env.DATABASE_URL_DOCKER,
  DATABASE_URL: process.env.DATABASE_URL_DOCKER,
  LOG_LEVEL: 'info',
  METRICS_PREFIX: 'app_',
  SALT_WORK_FACTOR: process.env.SALT_WORK_FACTOR,
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL,
  PUBLIC_KEY: process.env.PUBLIC_KEY,
  REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
});
