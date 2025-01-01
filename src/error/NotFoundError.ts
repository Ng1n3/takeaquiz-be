import { BaseError } from './BaseError';

export class NotFoundError extends BaseError {
  constructor(
    message: string = 'Resource not found',
    meta?: Record<string, any>
  ) {
    super('NotFoundError', message, 404, true, meta);
  }
}
