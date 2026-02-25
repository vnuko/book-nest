import type { Request, Response, NextFunction } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { seriesRepo, authorRepo, bookRepo, fileRepo } from '../../db/repositories/index.js';
import {
  parsePagination,
  calculateOffset,
  buildPaginationResult,
} from '../../utils/index.js';
import { ApiErrorClass, throwNotFound } from '../middleware/errorHandler.js';
import { config } from '../../config/index.js';
import type { ApiResponse, SeriesResponse, BookResponse } from '../../types/api.js';
import type { CreateSeriesInput } from '../../types/db.js';

async function getSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query.page as string, req.query.limit as string);
    const offset = calculateOffset(page, limit);

    const seriesList = seriesRepo.findAll(limit, offset);
    const total = seriesRepo.count();

    const response: ApiResponse<SeriesResponse[]> = {
      data: seriesList.map(mapSeriesToResponse),
      pagination: buildPaginationResult(page, limit, total),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getSeriesById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const series = seriesRepo.findById(id);
    if (!series) {
      throwNotFound('Series', id);
    }

    const response: ApiResponse<SeriesResponse> = {
      data: mapSeriesToResponse(series),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function getSeriesBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const series = seriesRepo.findById(id);
    if (!series) {
      throwNotFound('Series', id);
    }

    const books = bookRepo.findBySeriesId(id);
    const author = authorRepo.findById(series.authorId);

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
          author: author
            ? { id: author.id, name: author.name, slug: author.slug }
            : { id: '', name: 'Unknown', slug: 'unknown' },
          series: { id: series.id, name: series.name, slug: series.slug },
          seriesOrder: book.seriesOrder,
          files: fileRepo
            .findByBookId(book.id)
            .filter((f) => f.type === 'book')
            .map((f) => ({ id: f.id, format: f.format, size: f.size })),
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
        })),
      ),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function searchSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      throw new ApiErrorClass('INVALID_QUERY', 'Search query is required', 400);
    }

    const { limit } = parsePagination(req.query.page as string, req.query.limit as string);

    const seriesList = seriesRepo.search(q.trim(), limit);

    const response: ApiResponse<SeriesResponse[]> = {
      data: seriesList.map(mapSeriesToResponse),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function updateSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, originalName } = req.body;

    if (name === undefined) {
      throw new ApiErrorClass('INVALID_INPUT', 'name is required', 400);
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ApiErrorClass('INVALID_INPUT', 'name must be a non-empty string', 400);
    }

    const series = seriesRepo.findById(id);
    if (!series) {
      throwNotFound('Series', id);
    }

    const updateData: Partial<Omit<CreateSeriesInput, 'id'>> = {
      name: name.trim(),
    };

    if (description !== undefined) {
      updateData.description = description === '' ? null : description;
    }

    if (originalName !== undefined) {
      updateData.originalName = originalName === '' ? null : originalName;
    }

    const updatedSeries = seriesRepo.update(id, updateData);

    const response: ApiResponse<SeriesResponse> = {
      data: mapSeriesToResponse(updatedSeries),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function deleteSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const series = seriesRepo.findById(id);
    if (!series) {
      throwNotFound('Series', id);
    }

    const author = authorRepo.findById(series.authorId);

    const seriesImagePath = path.join(
      config.paths.ebooks,
      author?.slug || 'unknown',
      `${series.slug}.jpg`,
    );
    if (await fs.pathExists(seriesImagePath)) {
      await fs.remove(seriesImagePath);
    }

    const books = bookRepo.findBySeriesId(id);
    for (const book of books) {
      bookRepo.update(book.id, { seriesId: null, seriesOrder: null });
    }

    seriesRepo.delete(id);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

function mapSeriesToResponse(
  series: NonNullable<ReturnType<typeof seriesRepo.findById>>,
): SeriesResponse {
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

export const seriesController = {
  getSeries,
  getSeriesById,
  getSeriesBooks,
  searchSeries,
  updateSeries,
  deleteSeries,
};
