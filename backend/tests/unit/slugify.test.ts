import { describe, it, expect } from '@jest/globals';
import { slugify, slugifyAuthor, slugifyBook, generateUniqueSlug } from '../../src/utils/slugify.js';

describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('Stephen King')).toBe('stephen-king');
  });

  it('should remove special characters', () => {
    expect(slugify("Harry Potter & the Philosopher's Stone")).toBe(
      'harry-potter-the-philosophers-stone',
    );
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Book   Title')).toBe('book-title');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(slugify('-Book Title-')).toBe('book-title');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle unicode characters', () => {
    expect(slugify('Český Název')).toBe('esk-nzev');
  });
});

describe('slugifyAuthor', () => {
  it('should slugify author names', () => {
    expect(slugifyAuthor('J.K. Rowling')).toBe('jk-rowling');
  });
});

describe('slugifyBook', () => {
  it('should slugify book titles', () => {
    expect(slugifyBook('The Lord of the Rings')).toBe('the-lord-of-the-rings');
  });
});

describe('generateUniqueSlug', () => {
  it('should return base slug if not in list', () => {
    expect(generateUniqueSlug('my-book', ['other-book'])).toBe('my-book');
  });

  it('should append -1 if slug exists', () => {
    expect(generateUniqueSlug('my-book', ['my-book'])).toBe('my-book-1');
  });

  it('should increment counter until unique', () => {
    expect(generateUniqueSlug('my-book', ['my-book', 'my-book-1', 'my-book-2'])).toBe('my-book-3');
  });
});
