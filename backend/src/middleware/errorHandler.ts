import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma unique constraint violation
  if (err?.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this identifier already exists or you have already applied.',
    });
  }

  // Prisma record not found
  if (err?.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Requested record not found.',
    });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({
    success: false,
    message: err?.message || 'Internal server error. Please try again later.',
    code: err?.code,
  });
};
