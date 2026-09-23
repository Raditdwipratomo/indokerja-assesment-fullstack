import { PrismaClient } from '@prisma/client';

let databaseUrl = (process.env.DATABASE_URL || '').trim();
// Strip surrounding single/double quotes if accidentally pasted into Vercel UI
databaseUrl = databaseUrl.replace(/^["']|["']$/g, '').trim();

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

export const prisma = new PrismaClient({
  datasources: databaseUrl
    ? {
        db: {
          url: databaseUrl,
        },
      }
    : undefined,
});

