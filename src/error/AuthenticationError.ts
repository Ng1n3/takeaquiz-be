import { BaseError } from './BaseError';

export class AuthenticationError extends BaseError {
  constructor(
    message: string = 'Authentication failed',
    meta?: Record<string, any>
  ) {
    super('AuthenticationError', message, 401, true, meta);
  }
}

export class ForbiddenError extends BaseError {
  constructor(messae: string = 'Forbidden', meta?: Record<string, any>) {
    super('ForbiddenError', messae, 403, true, meta);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string = 'Unauthorized', meta?: Record<string, any>) {
    super('AuthorizationError', message, 403, true, meta);
  }
}

