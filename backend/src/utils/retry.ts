import { config } from '../config/index.js';
import { logger } from './logger.js';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const maxRetries = options?.maxRetries ?? config.retry.maxRetries;
  const baseDelay = options?.baseDelay ?? config.retry.baseDelay;
  const shouldRetry = options?.shouldRetry ?? ((): boolean => true);
  const onRetry = options?.onRetry;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      const delay = baseDelay * attempt;

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      logger.warn(`Retry attempt ${attempt}/${maxRetries}`, {
        error: lastError.message,
        delayMs: delay,
      });

      await sleep(delay);
    }
  }

  throw lastError;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  const retryablePatterns = [
    'rate limit',
    '429',
    'timeout',
    'econnreset',
    'econnrefused',
    'enotfound',
    'network',
    'socket hang up',
  ];

  return retryablePatterns.some((pattern) => message.includes(pattern));
}
