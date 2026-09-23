import { Request, Response, NextFunction } from 'express';
import { JobsService } from './jobs.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { AuthRequest } from '../../middleware/auth';
import { JobType } from '@prisma/client';

export class JobsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, jobType } = req.query;
      const jobs = await JobsService.list({
        search: typeof search === 'string' ? search : undefined,
        jobType: typeof jobType === 'string' && Object.values(JobType).includes(jobType as JobType)
          ? (jobType as JobType)
          : undefined,
      });
      res.json(ApiResponse(true, jobs));
    } catch (e) {
      next(e);
    }
  }

  static async myJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const jobs = await JobsService.listByCompany(req.user!.id);
      res.json(ApiResponse(true, jobs));
    } catch (e) {
      next(e);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await JobsService.getOne(req.params.id);
      res.json(ApiResponse(true, job));
    } catch (e) {
      next(e);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const job = await JobsService.create(req.user!.id, req.body);
      res.status(201).json(ApiResponse(true, job));
    } catch (e) {
      next(e);
    }
  }
}
