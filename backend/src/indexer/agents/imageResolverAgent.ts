import { imageSearchService } from '../../services/imageSearchService.js';
import { imageService } from '../../services/imageService.js';
import { createBatchLogger } from '../../utils/logger.js';
import { config } from '../../config/index.js';
import { batchRepo } from '../../db/repositories/batchRepo.js';
import fs from 'fs-extra';
import path from 'path';
import type { ImageResolverAgentInput, ImageResolverAgentResult } from '../../types/agents.js';

class ImageResolverAgent {
  private ebooksDir: string;
  private publicDir: string;

  constructor() {
    this.ebooksDir = config.paths.ebooks;
    this.publicDir = path.join(process.cwd(), 'public');
  }

  async execute(input: ImageResolverAgentInput): Promise<ImageResolverAgentResult> {
    const batchLogger = createBatchLogger(input.batchId);
    batchLogger.info('=== STEP 2: IMAGE RESOLUTION - STARTED ===', {
      authorCount: input.authors.length,
      bookCount: input.books.length,
    });

    const authorResults = new Map<string, { imageUrl: string | null; confidence: number }>();
    const bookResults = new Map<string, { imageUrl: string | null; confidence: number }>();
    const seriesResults = new Map<string, { imageUrl: string | null; confidence: number }>();

    for (const author of input.authors) {
      batchLogger.info('Searching author image', { authorName: author.name });

      const searchResult = await imageSearchService.searchAuthorImage(author.name);
      const targetPath = path.join(this.ebooksDir, author.slug, 'author.jpg');

      let downloaded = false;

      if (searchResult.imageUrl) {
        downloaded = await imageService.downloadImage(searchResult.imageUrl, targetPath);
      }

      if (!downloaded) {
        batchLogger.info('Using default author image', { authorName: author.name });
        await this.copyDefaultAuthorImage(targetPath);
      }

      authorResults.set(author.slug, {
        imageUrl: targetPath,
        confidence: downloaded ? 0.9 : 0.5,
      });
    }

    for (const book of input.books) {
      batchLogger.info('Searching book cover', {
        title: book.title,
        authorName: book.authorName,
      });

      const searchResult = await imageSearchService.searchBookCover(book.title, book.authorName);
      const targetPath = path.join(this.ebooksDir, book.authorSlug, book.bookSlug, 'book.jpg');

      let downloaded = false;

      if (searchResult.imageUrl) {
        downloaded = await imageService.downloadImage(searchResult.imageUrl, targetPath);
      }

      if (!downloaded) {
        batchLogger.info('Using default book cover', { title: book.title });
        await this.copyDefaultBookCover(targetPath);
      }

      bookResults.set(`${book.authorSlug}/${book.bookSlug}`, {
        imageUrl: targetPath,
        confidence: downloaded ? 0.9 : 0.5,
      });
    }

    await this.storeResults(input.batchId, authorResults, bookResults);

    batchLogger.info('=== STEP 2: IMAGE RESOLUTION - COMPLETED ===', {
      authorsProcessed: input.authors.length,
      booksProcessed: input.books.length,
      allAuthorsHaveImages: authorResults.size === input.authors.length,
      allBooksHaveImages: bookResults.size === input.books.length,
    });

    return {
      authors: authorResults,
      books: bookResults,
      series: seriesResults,
    };
  }

  private async copyDefaultAuthorImage(targetPath: string): Promise<void> {
    const defaultPath = path.join(this.publicDir, 'default_author.jpg');
    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(defaultPath, targetPath, { overwrite: true });
  }

  private async copyDefaultBookCover(targetPath: string): Promise<void> {
    const bookCoverIndex = Math.floor(Math.random() * 4) + 1;
    const paddedIndex = String(bookCoverIndex).padStart(2, '0');
    const defaultPath = path.join(this.publicDir, `default_book_${paddedIndex}.jpg`);
    await fs.ensureDir(path.dirname(targetPath));
    await fs.copy(defaultPath, targetPath, { overwrite: true });
  }

  private async storeResults(
    batchId: string,
    authorResults: ImageResolverAgentResult['authors'],
    bookResults: ImageResolverAgentResult['books']
  ): Promise<void> {
    const summary = {
      authorCount: authorResults.size,
      bookCount: bookResults.size,
      authorsWithImages: authorResults.size,
      booksWithImages: bookResults.size,
    };

    const items = batchRepo.findItemsByBatchId(batchId);
    if (items.length > 0) {
      await batchRepo.updateItemStatus(items[0].id, 'images_fetched', JSON.stringify(summary));
    }
  }
}

export const imageResolverAgent = new ImageResolverAgent();
