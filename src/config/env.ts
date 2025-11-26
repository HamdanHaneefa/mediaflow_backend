import dotenv from 'dotenv';
import { z } from 'zod';
import logger from '../utils/logger';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  // Client Portal JWT (optional, falls back to JWT_SECRET)
  CLIENT_JWT_SECRET: z.string().optional(),
  CLIENT_JWT_EXPIRES_IN: z.string().default('24h'),
  FRONTEND_URL: z.string().url(),
  CORS_ORIGIN: z.string(),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().default('104857600'),
  // Email configuration (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  // Redis configuration (optional)
  REDIS_ENABLED: z.string().optional().default('false'),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().optional(),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error('❌ Invalid environment variables:', error.errors);
    throw new Error('Invalid environment variables');
  }
  throw error;
}

export default env;
