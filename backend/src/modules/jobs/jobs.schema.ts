import { z } from 'zod';
import { JobType } from '@prisma/client';

export const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().min(1),
  salary: z.number().positive(),
  jobType: z.nativeEnum(JobType),
});
