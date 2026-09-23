import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const applySchema = z.object({
  jobId: z.string().uuid(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});
