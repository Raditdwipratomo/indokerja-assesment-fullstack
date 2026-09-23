import { prisma } from '../../utils/prisma';
import { ApiError } from '../../utils/ApiError';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationsService {
  static async apply(jobSeekerId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    // Explicit duplicate check
    const existing = await prisma.application.findUnique({
      where: {
        jobId_jobSeekerId: {
          jobId,
          jobSeekerId,
        },
      },
    });

    if (existing) {
      throw new ApiError(409, 'You have already applied to this job.');
    }

    return prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobId,
          jobSeekerId,
          status: ApplicationStatus.APPLIED,
          history: {
            create: { status: ApplicationStatus.APPLIED },
          },
        },
        include: {
          job: {
            include: {
              company: { select: { id: true, name: true } },
            },
          },
          history: true,
        },
      });
      return app;
    });
  }

  static async getMyApplications(jobSeekerId: string) {
    return prisma.application.findMany({
      where: { jobSeekerId },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true } },
          },
        },
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getJobApplicants(companyId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }
    if (job.companyId !== companyId) {
      throw new ApiError(403, 'Forbidden: You do not own this job');
    }

    return prisma.application.findMany({
      where: { jobId },
      include: {
        jobSeeker: {
          select: { id: true, name: true, email: true },
        },
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateStatus(companyId: string, applicationId: string, status: ApplicationStatus) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!app) {
      throw new ApiError(404, 'Application not found');
    }

    if (app.job.companyId !== companyId) {
      throw new ApiError(403, 'Forbidden: You do not own the job for this application');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: {
          status,
          history: {
            create: { status },
          },
        },
        include: {
          jobSeeker: { select: { id: true, name: true, email: true } },
          history: { orderBy: { createdAt: 'desc' } },
        },
      });
      return updated;
    });
  }

  static async getHistory(userId: string, role: string, applicationId: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        history: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!app) {
      throw new ApiError(404, 'Application not found');
    }

    if (role === 'JOB_SEEKER' && app.jobSeekerId !== userId) {
      throw new ApiError(403, 'Forbidden: You cannot view this application history');
    }

    if (role === 'COMPANY' && app.job.companyId !== userId) {
      throw new ApiError(403, 'Forbidden: You cannot view this application history');
    }

    return app.history;
  }
}
