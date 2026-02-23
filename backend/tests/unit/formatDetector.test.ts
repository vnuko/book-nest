import { describe, it, expect } from '@jest/globals';
import {
  detectFormat,
  isEbookFile,
  getConversionTargets,
} from '../../src/utils/formatDetector.js';

describe('detectFormat', () => {
  it('should detect epub format', () => {
    expect(detectFormat('book.epub')).toBe('epub');
  });

  it('should detect mobi format', () => {
    expect(detectFormat('book.mobi')).toBe('mobi');
  });

  it('should detect txt format', () => {
    expect(detectFormat('book.txt')).toBe('txt');
  });

  it('should detect pdf format', () => {
    expect(detectFormat('book.pdf')).toBe('pdf');
  });

  it('should be case insensitive', () => {
    expect(detectFormat('book.EPUB')).toBe('epub');
    expect(detectFormat('book.MOBI')).toBe('mobi');
  });

  it('should return null for unsupported formats', () => {
    expect(detectFormat('book.docx')).toBe(null);
    expect(detectFormat('book.xls')).toBe(null);
  });

  it('should handle full paths', () => {
    expect(detectFormat('/path/to/book.epub')).toBe('epub');
  });
});

describe('isEbookFile', () => {
  it('should return true for ebook files', () => {
    expect(isEbookFile('book.epub')).toBe(true);
    expect(isEbookFile('book.mobi')).toBe(true);
  });

  it('should return false for non-ebook files', () => {
    expect(isEbookFile('image.jpg')).toBe(false);
    expect(isEbookFile('document.docx')).toBe(false);
  });
});

describe('getConversionTargets', () => {
  it('should return formats excluding source', () => {
    const targets = getConversionTargets('epub');
    expect(targets).not.toContain('epub');
    expect(targets.length).toBeGreaterThan(0);
  });
});
