import { Response, NextFunction, Request } from 'express';
import { ApplicationsService } from './applications.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { AuthRequest } from '../../middleware/auth';

export class ApplicationsController {
  static async apply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const app = await ApplicationsService.apply(req.user!.id, req.body.jobId);
      res.status(201).json(ApiResponse(true, app));
    } catch (e) { next(e); }
  }
  static async getMyApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const apps = await ApplicationsService.getMyApplications(req.user!.id);
      res.json(ApiResponse(true, apps));
    } catch (e) { next(e); }
  }
  static async getJobApplicants(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const applicants = await ApplicationsService.getJobApplicants(req.user!.id, req.params.jobId);
      res.json(ApiResponse(true, applicants));
    } catch (e) { next(e); }
  }
  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await ApplicationsService.updateStatus(req.user!.id, req.params.id, req.body.status);
      res.json(ApiResponse(true, updated));
    } catch (e) { next(e); }
  }
  static async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await ApplicationsService.getHistory(req.user!.id, req.user!.role, req.params.id);
      res.json(ApiResponse(true, history));
    } catch (e) { next(e); }
  }
}
