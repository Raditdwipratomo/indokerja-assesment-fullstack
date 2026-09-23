import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { AuthRequest } from '../../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(ApiResponse(true, result));
    } catch (e) { next(e); }
  }
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.json(ApiResponse(true, result));
    } catch (e) { next(e); }
  }
  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.me(req.user!.id);
      res.json(ApiResponse(true, user));
    } catch (e) { next(e); }
  }
}
