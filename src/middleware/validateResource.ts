import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { AuthenticationError } from '../error/AuthenticationError';

const validates =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return new AuthenticationError(error.errors);
    }
  };
