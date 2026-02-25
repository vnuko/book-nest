import type { Request, Response, NextFunction } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { authorRepo, bookRepo, seriesRepo, fileRepo } from '../../db/repositories/index.js';
import {
  parsePagination,
  calculateOffset,
  buildPaginationResult,
} from '../../utils/index.js';
import { ApiErrorClass, throwNotFound } from '../middleware/errorHandler.js';
import { config } from '../../config/index.js';
import type { ApiResponse, AuthorResponse, BookResponse } from '../../types/api.js';
import type { CreateAuthorInput } from '../../types/db.js';

async function getAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query.page as string, req.query.limit as string);
    const offset = calculateOffset(page, limit);

    const authors = authorRepo.findAll(limit, offset);
    const total = authorRepo.count();

    const response: ApiResponse<AuthorResponse[]> = {
      data: authors.map(mapAuthorToResponse),
      pagination: buildPaginationResult(page, limit, total),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getAuthorById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const author = authorRepo.findById(id);
    if (!author) {
      throwNotFound('Author', id);
    }

    const response: ApiResponse<AuthorResponse> = {
      data: mapAuthorToResponse(author),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getAuthorBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const author = authorRepo.findById(id);
    if (!author) {
      throwNotFound('Author', id);
    }

    const { page, limit } = parsePagination(req.query.page as string, req.query.limit as string);
    const offset = calculateOffset(page, limit);

    const books = bookRepo.findByAuthorId(id, limit, offset);
    const total = bookRepo.count();

    const response: ApiResponse<BookResponse[]> = {
      data: await Promise.all(
        books.map(async (book) => ({
          id: book.id,
          title: book.title,
          originalTitle: book.originalTitle,
          slug: book.slug,
          description: book.description,
          firstPublishYear: book.firstPublishYear,
          liked: Boolean(book.liked),
          author: { id: author.id, name: author.name, slug: author.slug },
          series: getSeriesInfo(book.seriesId),
          seriesOrder: book.seriesOrder,
          files: fileRepo
            .findByBookId(book.id)
            .filter((f) => f.type === 'book')
            .map((f) => ({ id: f.id, format: f.format, size: f.size })),
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
        })),
      ),
      pagination: buildPaginationResult(page, limit, total),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getAuthorSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const author = authorRepo.findById(id);
    if (!author) {
      throwNotFound('Author', id);
    }

    const seriesList = seriesRepo.findByAuthorId(id);

    const response: ApiResponse<
      Array<{
        id: string;
        name: string;
        originalName: string | null;
        slug: string;
        description: string | null;
        bookCount: number;
      }>
    > = {
      data: seriesList.map((s) => ({
        id: s.id,
        name: s.name,
        originalName: s.originalName,
        slug: s.slug,
        description: s.description,
        bookCount: bookRepo.findBySeriesId(s.id).length,
      })),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function searchAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      throw new ApiErrorClass('INVALID_QUERY', 'Search query is required', 400);
    }

    const { limit } = parsePagination(req.query.page as string, req.query.limit as string);

    const authors = authorRepo.search(q.trim(), limit);

    const response: ApiResponse<AuthorResponse[]> = {
      data: authors.map(mapAuthorToResponse),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function updateAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, bio, dateOfBirth, nationality } = req.body;

    if (name === undefined) {
      throw new ApiErrorClass('INVALID_INPUT', 'name is required', 400);
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ApiErrorClass('INVALID_INPUT', 'name must be a non-empty string', 400);
    }

    const author = authorRepo.findById(id);
    if (!author) {
      throwNotFound('Author', id);
    }

    const updateData: Partial<Omit<CreateAuthorInput, 'id'>> = {
      name: name.trim(),
    };

    if (bio !== undefined) {
      updateData.bio = bio === '' ? null : bio;
    }

    if (dateOfBirth !== undefined) {
      updateData.dateOfBirth = dateOfBirth === null ? null : String(dateOfBirth);
    }

    if (nationality !== undefined) {
      updateData.nationality = nationality === '' || nationality === null ? null : nationality;
    }

    const updatedAuthor = authorRepo.update(id, updateData);

    const response: ApiResponse<AuthorResponse> = {
      data: mapAuthorToResponse(updatedAuthor),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function deleteAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const author = authorRepo.findById(id);
    if (!author) {
      throwNotFound('Author', id);
    }

    const books = bookRepo.findByAuthorId(id, 1000, 0);
    if (books.length > 0) {
      throw new ApiErrorClass(
        'CONFLICT',
        `Cannot delete author with ${books.length} book(s) attached. Delete or move the books first.`,
        400
      );
    }

    const seriesList = seriesRepo.findByAuthorId(id);
    if (seriesList.length > 0) {
      throw new ApiErrorClass(
        'CONFLICT',
        `Cannot delete author with ${seriesList.length} series attached. Delete the series first.`,
        400
      );
    }

    const authorFolderPath = path.join(config.paths.ebooks, author.slug);
    if (await fs.pathExists(authorFolderPath)) {
      await fs.remove(authorFolderPath);
    }

    authorRepo.delete(id);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

function mapAuthorToResponse(
  author: NonNullable<ReturnType<typeof authorRepo.findById>>,
): AuthorResponse {
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

function getSeriesInfo(
  seriesId: string | null,
): { id: string; name: string; slug: string } | null {
  if (!seriesId) return null;
  const s = seriesRepo.findById(seriesId);
  return s ? { id: s.id, name: s.name, slug: s.slug } : null;
}

export const authorsController = {
  getAuthors,
  getAuthorById,
  getAuthorBooks,
  getAuthorSeries,
  searchAuthors,
  updateAuthor,
  deleteAuthor,
};
