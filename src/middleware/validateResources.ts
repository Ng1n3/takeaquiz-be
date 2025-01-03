import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { ValidationError } from '../error/ValidationError';

export const validateResources =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        throw new ValidationError('Validation failed', {
          validationErrors: result.error.issues,
        });
      }

      req.validatedData = result.data;
      return next();
    } catch (error) {
      next(error);
    }
  };
