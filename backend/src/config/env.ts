import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.trim().replace(/^["']|["']$/g, '').trim();
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default(''),
  JWT_SECRET: z.string().min(1).default('indokerja-jwt-secret-key-2026-super-secure'),
  FRONTEND_URL: z.string().default('*'),
  PORT: z.string().default('3000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.warn('⚠️ Environment variables warning:', _env.error.format());
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'indokerja-jwt-secret-key-2026-super-secure',
  FRONTEND_URL: process.env.FRONTEND_URL || '*',
  PORT: process.env.PORT || '3000',
};
