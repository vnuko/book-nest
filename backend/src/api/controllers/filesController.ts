import type { Request, Response, NextFunction } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileRepo, bookRepo, authorRepo, seriesRepo } from '../../db/repositories/index.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { throwNotFound, ApiErrorClass } from '../middleware/errorHandler.js';

async function downloadBookFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bookId, format } = req.params;

    const book = bookRepo.findById(bookId);
    if (!book) {
      throwNotFound('Book', bookId);
    }

    const files = fileRepo.findByBookId(bookId);
    const bookFile = files.find((f) => f.type === 'book' && f.format === format);

    if (!bookFile) {
      throw new ApiErrorClass(
        'FILE_NOT_FOUND',
        `File with format '${format}' not found for book '${bookId}'`,
        404
      );
    }

    const filePath = bookFile.path;

    if (!(await fs.pathExists(filePath))) {
      throw new ApiErrorClass('FILE_NOT_FOUND', `File not found on disk: ${filePath}`, 404);
    }

    const fileName = `${book.slug}.${format}`;

    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error('File download failed', err, { bookId, format });
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getAuthorImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { authorId } = req.params;

    const author = authorRepo.findById(authorId);
    if (!author) {
      throwNotFound('Author', authorId);
    }

    const imagePath = path.join(config.paths.ebooks, author.slug, 'author.jpg');

    if (!(await fs.pathExists(imagePath))) {
      throw new ApiErrorClass('IMAGE_NOT_FOUND', `No image found for author '${authorId}'`, 404);
    }

    res.sendFile(path.resolve(imagePath));
  } catch (error) {
    next(error);
  }
}

async function getBookImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bookId } = req.params;

    const book = bookRepo.findById(bookId);
    if (!book) {
      throwNotFound('Book', bookId);
    }

    const author = authorRepo.findById(book.authorId);
    const imagePath = path.join(
      config.paths.ebooks,
      author?.slug || 'unknown',
      book.slug,
      'book.jpg'
    );

    if (!(await fs.pathExists(imagePath))) {
      throw new ApiErrorClass('IMAGE_NOT_FOUND', `No cover image found for book '${bookId}'`, 404);
    }

    res.sendFile(path.resolve(imagePath));
  } catch (error) {
    next(error);
  }
}

async function getSeriesImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { seriesId } = req.params;

    const series = seriesRepo.findById(seriesId);
    if (!series) {
      throwNotFound('Series', seriesId);
    }

    const author = authorRepo.findById(series.authorId);
    const imagePath = path.join(
      config.paths.ebooks,
      author?.slug || 'unknown',
      `${series.slug}.jpg`
    );

    if (!(await fs.pathExists(imagePath))) {
      throw new ApiErrorClass('IMAGE_NOT_FOUND', `No image found for series '${seriesId}'`, 404);
    }

    res.sendFile(path.resolve(imagePath));
  } catch (error) {
    next(error);
  }
}

export const filesController = {
  downloadBookFile,
  getAuthorImage,
  getBookImage,
  getSeriesImage,
};
