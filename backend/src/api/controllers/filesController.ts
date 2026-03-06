import type { Request, Response, NextFunction } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileRepo, bookRepo, authorRepo, seriesRepo } from '../../db/repositories/index.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { throwNotFound, ApiErrorClass } from '../middleware/errorHandler.js';
import { ImageProcessor } from '../../utils/imageProcessor.js';

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

async function uploadAuthorImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = req.file;
  try {
    const { authorId } = req.params;

    if (!file) {
      throw new ApiErrorClass('NO_FILE', 'No file uploaded', 400);
    }

    const author = authorRepo.findById(authorId);
    if (!author) {
      throwNotFound('Author', authorId);
    }

    const ext = path.extname(file.originalname || 'image.jpg').toLowerCase().slice(1);
    const filename = `author.${ext === 'jpeg' ? 'jpg' : ext}`;
    const targetPath = path.join(config.paths.ebooks, author.slug, filename);

    await fs.ensureDir(path.dirname(targetPath));

    // Process author image specifically: preserve the exact crop provided by the frontend
    await ImageProcessor.processAuthorImage(file, targetPath);

    res.json({ success: true });
  } catch (error) {
    next(error);
  } finally {
    if (file && (await fs.pathExists(file.path))) {
      await fs.unlink(file.path);
    }
  }
}

async function uploadBookImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = req.file;
  try {
    const { bookId } = req.params;

    if (!file) {
      throw new ApiErrorClass('NO_FILE', 'No file uploaded', 400);
    }

    const book = bookRepo.findById(bookId);
    if (!book) {
      throwNotFound('Book', bookId);
    }

    const author = authorRepo.findById(book.authorId);
    const ext = path.extname(file.originalname || 'image.jpg').toLowerCase().slice(1);
    const filename = `book.${ext === 'jpeg' ? 'jpg' : ext}`;
    const targetPath = path.join(
      config.paths.ebooks,
      author?.slug || 'unknown',
      book.slug,
      filename
    );

    await fs.ensureDir(path.dirname(targetPath));

    // Process image to ensure standard book cover aspect ratio without crop 
    await ImageProcessor.validateAndProcessForUpload(file, targetPath);

    res.json({ success: true });
  } catch (error) {
    next(error);
  } finally {
    if (file && (await fs.pathExists(file.path))) {
      await fs.unlink(file.path);
    }
  }
}

async function uploadSeriesImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = req.file;
  try {
    const { seriesId } = req.params;

    if (!file) {
      throw new ApiErrorClass('NO_FILE', 'No file uploaded', 400);
    }

    const series = seriesRepo.findById(seriesId);
    if (!series) {
      throwNotFound('Series', seriesId);
    }

    const author = authorRepo.findById(series.authorId);
    const ext = path.extname(file.originalname || 'image.jpg').toLowerCase().slice(1);
    const filename = `${series.slug}.${ext === 'jpeg' ? 'jpg' : ext}`;
    const targetPath = path.join(config.paths.ebooks, author?.slug || 'unknown', filename);

    await fs.ensureDir(path.dirname(targetPath));

    // Process image to ensure standard aspect ratio without crop
    await ImageProcessor.validateAndProcessForUpload(file, targetPath);

    res.json({ success: true });
  } catch (error) {
    next(error);
  } finally {
    if (file && (await fs.pathExists(file.path))) {
      await fs.unlink(file.path);
    }
  }
}

export const filesController = {
  downloadBookFile,
  getAuthorImage,
  getBookImage,
  getSeriesImage,
  uploadAuthorImage,
  uploadBookImage,
  uploadSeriesImage,
};
