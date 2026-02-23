import { describe, it, expect } from '@jest/globals';
import {
  parsePagination,
  calculateOffset,
  buildPaginationResult,
} from '../../src/utils/pagination.js';

describe('parsePagination', () => {
  it('should return default values for undefined input', () => {
    const result = parsePagination(undefined, undefined);
    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it('should parse string input', () => {
    const result = parsePagination('2', '50');
    expect(result).toEqual({ page: 2, limit: 50 });
  });

  it('should handle number input', () => {
    const result = parsePagination(3, 10);
    expect(result).toEqual({ page: 3, limit: 10 });
  });

  it('should enforce minimum page of 1', () => {
    const result = parsePagination(0, 10);
    expect(result.page).toBe(1);
  });

  it('should enforce minimum limit of 1', () => {
    const result = parsePagination(1, -1);
    expect(result.limit).toBe(1);
  });

  it('should enforce maximum limit of 100', () => {
    const result = parsePagination(1, 200);
    expect(result.limit).toBe(100);
  });
});

describe('calculateOffset', () => {
  it('should calculate correct offset', () => {
    expect(calculateOffset(1, 20)).toBe(0);
    expect(calculateOffset(2, 20)).toBe(20);
    expect(calculateOffset(3, 50)).toBe(100);
  });
});

describe('buildPaginationResult', () => {
  it('should build correct pagination result', () => {
    const result = buildPaginationResult(1, 20, 100);
    expect(result).toEqual({
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
    });
  });

  it('should round up total pages', () => {
    const result = buildPaginationResult(1, 20, 101);
    expect(result.totalPages).toBe(6);
  });

  it('should handle zero total', () => {
    const result = buildPaginationResult(1, 20, 0);
    expect(result.totalPages).toBe(0);
  });
});
