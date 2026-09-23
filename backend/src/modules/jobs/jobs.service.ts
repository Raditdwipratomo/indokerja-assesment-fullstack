import { prisma } from '../../utils/prisma';
import { ApiError } from '../../utils/ApiError';
import { JobType, Prisma } from '@prisma/client';

interface ListJobsParams {
  search?: string;
  jobType?: JobType;
}

export class JobsService {
  static async list(params?: ListJobsParams) {
    const where: Prisma.JobWhereInput = {};

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { location: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.jobType) {
      where.jobType = params.jobType;
    }

    return prisma.job.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async listByCompany(companyId: string) {
    return prisma.job.findMany({
      where: { companyId },
      include: {
        company: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOne(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!job) throw new ApiError(404, 'Job not found');
    return job;
  }

  static async create(companyId: string, data: {
    title: string;
    description?: string;
    location: string;
    salary: number;
    jobType: JobType;
  }) {
    return prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        salary: data.salary,
        jobType: data.jobType,
        companyId,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
