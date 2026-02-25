import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs-extra';
import { config } from '../../config/index.js';
import { bookRepo, authorRepo, seriesRepo, fileRepo } from '../../db/repositories/index.js';
import {
  parsePagination,
  calculateOffset,
  buildPaginationResult,
} from '../../utils/index.js';
import { ApiErrorClass, throwNotFound } from '../middleware/errorHandler.js';
import type { ApiResponse, BookResponse } from '../../types/api.js';
import type { CreateBookInput } from '../../types/db.js';

async function getBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query.page as string, req.query.limit as string);
    const offset = calculateOffset(page, limit);

    const books = bookRepo.findAll(limit, offset);
    const total = bookRepo.count();

    const response: ApiResponse<BookResponse[]> = {
      data: await Promise.all(books.map(mapBookToResponse)),
      pagination: buildPaginationResult(page, limit, total),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getBookById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const book = bookRepo.findById(id);
    if (!book) {
      throwNotFound('Book', id);
    }

    const response: ApiResponse<BookResponse> = {
      data: await mapBookToResponse(book),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getBookFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const book = bookRepo.findById(id);
    if (!book) {
      throwNotFound('Book', id);
    }

    const files = fileRepo.findByBookId(id);

    res.json({
      data: files.map((f) => ({
        id: f.id,
        type: f.type,
        format: f.format,
        path: f.path,
        size: f.size,
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function searchBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      throw new ApiErrorClass('INVALID_QUERY', 'Search query is required', 400);
    }

    const { page, limit } = parsePagination(req.query.page as string, req.query.limit as string);

    const books = bookRepo.search(q.trim(), limit);
    const total = books.length;

    const response: ApiResponse<BookResponse[]> = {
      data: await Promise.all(books.map(mapBookToResponse)),
      pagination: buildPaginationResult(page, limit, total),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getBooksByAuthor(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { authorId } = req.params;

    const author = authorRepo.findById(authorId);
    if (!author) {
      throwNotFound('Author', authorId);
    }

    const { page, limit } = parsePagination(req.query.page as string, req.query.limit as string);
    const offset = calculateOffset(page, limit);

    const books = bookRepo.findByAuthorId(authorId, limit, offset);
    const total = bookRepo.count();

    const response: ApiResponse<BookResponse[]> = {
      data: await Promise.all(books.map(mapBookToResponse)),
      pagination: buildPaginationResult(page, limit, total),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getBooksBySeries(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { seriesId } = req.params;

    const series = seriesRepo.findById(seriesId);
    if (!series) {
      throwNotFound('Series', seriesId);
    }

    const books = bookRepo.findBySeriesId(seriesId);

    const response: ApiResponse<BookResponse[]> = {
      data: await Promise.all(books.map(mapBookToResponse)),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function toggleBookLike(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { liked } = req.body;

    if (typeof liked !== 'boolean') {
      throw new ApiErrorClass('INVALID_INPUT', 'liked must be a boolean', 400);
    }

    const book = bookRepo.findById(id);
    if (!book) {
      throwNotFound('Book', id);
    }

    const updatedBook = bookRepo.toggleLike(id, liked);

    const response: ApiResponse<BookResponse> = {
      data: await mapBookToResponse(updatedBook!),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function updateBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, firstPublishYear } = req.body;

    if (title === undefined) {
      throw new ApiErrorClass('INVALID_INPUT', 'title is required', 400);
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new ApiErrorClass('INVALID_INPUT', 'title must be a non-empty string', 400);
    }

    const book = bookRepo.findById(id);
    if (!book) {
      throwNotFound('Book', id);
    }

    const updateData: Partial<Omit<CreateBookInput, 'id'>> = {
      title: title.trim(),
    };

    if (description !== undefined) {
      updateData.description = description === '' ? null : description;
    }

    if (firstPublishYear !== undefined) {
      updateData.firstPublishYear = firstPublishYear === null ? null : Number(firstPublishYear);
    }

    const updatedBook = bookRepo.update(id, updateData);

    const response: ApiResponse<BookResponse> = {
      data: await mapBookToResponse(updatedBook),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function deleteBook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const book = bookRepo.findById(id);
    if (!book) {
      throwNotFound('Book', id);
    }

    const author = authorRepo.findById(book.authorId);

    const bookFolderPath = path.join(
      config.paths.ebooks,
      author?.slug || 'unknown',
      book.slug
    );

    if (await fs.pathExists(bookFolderPath)) {
      await fs.remove(bookFolderPath);
    }

    bookRepo.delete(id);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

async function unlinkBookFromSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const book = bookRepo.findById(id);
    if (!book) {
      throwNotFound('Book', id);
    }

    const updatedBook = bookRepo.update(id, {
      seriesId: null,
      seriesOrder: null,
    });

    const response: ApiResponse<BookResponse> = {
      data: await mapBookToResponse(updatedBook),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function mapBookToResponse(
  book: NonNullable<ReturnType<typeof bookRepo.findById>>,
): Promise<BookResponse> {
  const author = authorRepo.findById(book.authorId);
  const series = book.seriesId ? seriesRepo.findById(book.seriesId) : null;
  const files = fileRepo.findByBookId(book.id);

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
    files: files
      .filter((f) => f.type === 'book')
      .map((f) => ({ id: f.id, format: f.format, size: f.size })),
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
}

export const booksController = {
  getBooks,
  getBookById,
  getBookFiles,
  searchBooks,
  getBooksByAuthor,
  getBooksBySeries,
  toggleBookLike,
  updateBook,
  deleteBook,
  unlinkBookFromSeries,
};
