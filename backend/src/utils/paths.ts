import path from 'path';
import type { EbookFormat } from './formatDetector.js';

export function buildBookPath(
  ebooksDir: string,
  authorSlug: string,
  bookSlug: string,
  sha256: string,
  format: EbookFormat,
): string {
  return path.join(ebooksDir, authorSlug, bookSlug, `${sha256}.${format}`);
}

export function buildAuthorImagePath(ebooksDir: string, authorSlug: string): string {
  return path.join(ebooksDir, authorSlug, 'author.jpg');
}

export function buildBookImagePath(ebooksDir: string, authorSlug: string, bookSlug: string): string {
  return path.join(ebooksDir, authorSlug, bookSlug, 'book-cover.jpg');
}

export function buildAuthorDir(ebooksDir: string, authorSlug: string): string {
  return path.join(ebooksDir, authorSlug);
}

export function buildBookDir(ebooksDir: string, authorSlug: string, bookSlug: string): string {
  return path.join(ebooksDir, authorSlug, bookSlug);
}
