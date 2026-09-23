import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((err) => `${err.path.join('.') || 'body'}: ${err.message}`)
          .join('; ');
        return res.status(400).json({ success: false, message });
      }
      return res.status(400).json({ success: false, message: 'Invalid request data' });
    }
  };
};
