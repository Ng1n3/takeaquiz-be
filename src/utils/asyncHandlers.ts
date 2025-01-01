import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
