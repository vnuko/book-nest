import { describe, it, expect } from '@jest/globals';
import {
  generateId,
  generateAuthorId,
  generateBookId,
  generateBatchId,
} from '../../src/utils/idGenerator.js';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateId', () => {
  it('should generate a valid UUID', () => {
    const id = generateId();
    expect(id).toMatch(uuidRegex);
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('generateAuthorId', () => {
  it('should generate a valid UUID for author', () => {
    const id = generateAuthorId();
    expect(id).toMatch(uuidRegex);
  });
});

describe('generateBookId', () => {
  it('should generate a valid UUID for book', () => {
    const id = generateBookId();
    expect(id).toMatch(uuidRegex);
  });
});

describe('generateBatchId', () => {
  it('should generate batch ID with date', () => {
    const id = generateBatchId();
    const today = new Date().toISOString().split('T')[0];
    expect(id).toMatch(new RegExp(`^batch-${today}-[a-f0-9]{8}$`));
  });
});
