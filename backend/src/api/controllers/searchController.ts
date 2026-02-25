import type { Request, Response, NextFunction } from 'express';
import { bookRepo, authorRepo, seriesRepo, fileRepo } from '../../db/repositories/index.js';
import type { ApiResponse, SearchResponse, BookResponse, AuthorResponse, SeriesResponse } from '../../types/api.js';

const SEARCH_LIMIT = 10;

async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      const response: ApiResponse<SearchResponse> = {
        data: {
          books: [],
          authors: [],
          series: [],
        },
      };
      res.json(response);
      return;
    }

    const query = q.trim();
    const lowerQuery = query.toLowerCase();

    const books = bookRepo.search(lowerQuery, SEARCH_LIMIT);
    const authors = authorRepo.search(lowerQuery, SEARCH_LIMIT);
    const seriesList = seriesRepo.search(lowerQuery, SEARCH_LIMIT);

    const response: ApiResponse<SearchResponse> = {
      data: {
        books: books.map(mapBookToResponse),
        authors: authors.map(mapAuthorToResponse),
        series: seriesList.map(mapSeriesToResponse),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

function mapBookToResponse(book: ReturnType<typeof bookRepo.findById>): BookResponse {
  if (!book) {
    throw new Error('Book not found');
  }

  const author = authorRepo.findById(book.authorId);
  const series = book.seriesId ? seriesRepo.findById(book.seriesId) : null;
  const files = fileRepo
    .findByBookId(book.id)
    .filter((f) => f.type === 'book')
    .map((f) => ({ id: f.id, format: f.format, size: f.size }));

  return {
    id: book.id,
    title: book.title,
    originalTitle: book.originalTitle,
    slug: book.slug,
    description: book.description,
    firstPublishYear: book.firstPublishYear,
    liked: Boolean(book.liked),
    author: author
      ? { id: author.id, name: author.name, slug: author.slug }
      : { id: '', name: 'Unknown', slug: 'unknown' },
    series: series ? { id: series.id, name: series.name, slug: series.slug } : null,
    seriesOrder: book.seriesOrder,
    files,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
}

function mapAuthorToResponse(author: ReturnType<typeof authorRepo.findById>): AuthorResponse {
  if (!author) {
    throw new Error('Author not found');
  }

  const bookCount = bookRepo.findByAuthorId(author.id, 1000, 0).length;

  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    bio: author.bio,
    nationality: author.nationality,
    dateOfBirth: author.dateOfBirth,
    bookCount,
    createdAt: author.createdAt,
    updatedAt: author.updatedAt,
  };
}

function mapSeriesToResponse(series: ReturnType<typeof seriesRepo.findById>): SeriesResponse {
  if (!series) {
    throw new Error('Series not found');
  }

  const author = authorRepo.findById(series.authorId);
  const bookCount = bookRepo.findBySeriesId(series.id).length;

  return {
    id: series.id,
    name: series.name,
    originalName: series.originalName,
    slug: series.slug,
    description: series.description,
    author: author
      ? { id: author.id, name: author.name, slug: author.slug }
      : { id: '', name: 'Unknown', slug: 'unknown' },
    bookCount,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
  };
}

export const searchController = {
  search,
};
