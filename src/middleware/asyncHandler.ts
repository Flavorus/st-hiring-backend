import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error) {
      // catch the error and pass it to the next middleware (error handler)
      next(error);
    }
  };
};
