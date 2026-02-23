import { describe, it, expect } from '@jest/globals';
import { withRetry, sleep, isRetryableError } from '../../src/utils/retry.js';

describe('withRetry', () => {
  it('should return result on first success', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      return 'success';
    };
    const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 });

    expect(result).toBe('success');
    expect(callCount).toBe(1);
  });

  it('should retry on failure', async () => {
    let callCount = 0;
    const fn = async (): Promise<string> => {
      callCount++;
      if (callCount === 1) throw new Error('fail 1');
      if (callCount === 2) throw new Error('fail 2');
      return 'success';
    };

    const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 });

    expect(result).toBe('success');
    expect(callCount).toBe(3);
  });

  it('should throw after max retries', async () => {
    let callCount = 0;
    const fn = async (): Promise<string> => {
      callCount++;
      throw new Error('always fails');
    };

    await expect(withRetry(fn, { maxRetries: 3, baseDelay: 10 })).rejects.toThrow('always fails');
    expect(callCount).toBe(3);
  });

  it('should respect shouldRetry option', async () => {
    let callCount = 0;
    const fn = async (): Promise<string> => {
      callCount++;
      throw new Error('non-retryable');
    };
    const shouldRetry = () => false;

    await expect(withRetry(fn, { maxRetries: 3, baseDelay: 10, shouldRetry })).rejects.toThrow();
    expect(callCount).toBe(1);
  });

  it('should call onRetry callback', async () => {
    let callCount = 0;
    const fn = async (): Promise<string> => {
      callCount++;
      if (callCount === 1) throw new Error('fail');
      return 'success';
    };
    let retryCallCount = 0;
    const onRetry = () => {
      retryCallCount++;
    };

    await withRetry(fn, { maxRetries: 3, baseDelay: 10, onRetry });

    expect(retryCallCount).toBe(1);
  });
});

describe('sleep', () => {
  it('should delay execution', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});

describe('isRetryableError', () => {
  it('should identify rate limit errors', () => {
    expect(isRetryableError(new Error('rate limit exceeded'))).toBe(true);
    expect(isRetryableError(new Error('Error 429'))).toBe(true);
  });

  it('should identify timeout errors', () => {
    expect(isRetryableError(new Error('request timeout'))).toBe(true);
  });

  it('should identify network errors', () => {
    expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
    expect(isRetryableError(new Error('network error'))).toBe(true);
  });

  it('should return false for non-retryable errors', () => {
    expect(isRetryableError(new Error('invalid input'))).toBe(false);
  });
});
