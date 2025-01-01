import { NextFunction, Request, Response } from 'express';
import { BaseError } from '../error/BaseError';

export class ErrorHandler {
  static handleError(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Log the error (you can use a logging service here)
    console.error('Unhandled Error:', error);

    if (error instanceof BaseError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.name,
        isOperational: error.isOperational,
        meta: error.meta || null,
      });
      return;
    }

    // Handle unexpected errors
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      isOperational: false,
    });
  }
}
