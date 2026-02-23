import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger.js';
import type { ApiError } from '../../types/api.js';

export function notFoundHandler(req: Request, res: Response): void {
  const error: ApiError = {
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
    },
  };
  res.status(404).json(error);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('Unhandled error', err);

  if (err instanceof ApiErrorClass) {
    const error: ApiError = {
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
      },
    };
    res.status(err.statusCode).json(error);
    return;
  }

  const error: ApiError = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
  };

  res.status(500).json(error);
}

export class ApiErrorClass extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

export function throwNotFound(resource: string, id: string): never {
  throw new ApiErrorClass(
    `${resource.toUpperCase()}_NOT_FOUND`,
    `${resource} with ID '${id}' not found`,
    404,
  );
}
