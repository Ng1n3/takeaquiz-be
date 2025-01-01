import { ZodIssue } from 'zod';
import { BaseError } from './BaseError';

export class ValidationError extends BaseError {
  constructor(
    message: string = 'Validation failed',
    meta?: { validationErrors?: ZodIssue[] }
  ) {
    super('ValidationError', message, 400, true, meta || {});
  }
}

export class UniqueConstraintError extends BaseError {
  constructor(field: string) {
    super(
      'UniqueConstraintError',
      `${field} already exists`,
      409,
      true,
      { field }
    );
  }
}
