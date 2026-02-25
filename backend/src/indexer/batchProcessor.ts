import { fileCrawler } from './crawler.js';
import { fileOrganizer } from './fileOrganizer.js';
import { nameResolverAgent, imageResolverAgent, metadataResolverAgent } from './agents/index.js';
import { createBatchLogger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { generateBatchId, generateBatchItemId, generateAuthorId, generateBookId, generateSeriesId, generateFileId, type EbookFormat } from '../utils/index.js';
import { batchRepo, authorRepo, bookRepo, seriesRepo, fileRepo } from '../db/repositories/index.js';
import type { NameResolverAgentResult } from '../types/agents.js';

export interface IndexingProgress {
  batchId: string;
  status: string;
  totalBooks: number;
  processedBooks: number;
  failedBooks: number;
  currentPhase: string;
}

export interface BatchProcessorResult {
  batchId: string;
  status: 'completed' | 'failed';
  resumed: boolean;
  totalBooks: number;
  processedBooks: number;
  failedBooks: number;
  duration: number;
  errors: string[];
}

interface PersistResult {
  successful: Array<{ filePath: string }>;
  failed: Array<{ filePath: string; error: string }>;
}

class BatchProcessor {
  private batchSize: number;

  constructor() {
    this.batchSize = config.ai.batchSize;
  }

  async startIndexing(): Promise<BatchProcessorResult> {
    const startTime = Date.now();

    const failedBatch = batchRepo.findByStatus('failed')[0];
    if (failedBatch) {
      return this.resumeBatch(failedBatch.id, startTime);
    }

    return this.startNewBatch(startTime);
  }

  private async resumeBatch(batchId: string, startTime: number): Promise<BatchProcessorResult> {
    const batchLogger = createBatchLogger(batchId);
    batchLogger.info('Resuming failed batch', { batchId });

    const batch = batchRepo.findById(batchId);
    if (!batch) {
      batchLogger.error('Batch not found for resume', undefined, { batchId });
      return this.startNewBatch(startTime);
    }

    const incompleteItems = batchRepo.findIncompleteItems(batchId);
    batchLogger.info('Found incomplete items', { count: incompleteItems.length });

    if (incompleteItems.length === 0) {
      batchRepo.complete(batchId);
      batchLogger.info('No incomplete items, marking batch as complete');
      return {
        batchId,
        status: 'completed',
        resumed: true,
        totalBooks: batch.totalBooks,
        processedBooks: batch.processedBooks,
        failedBooks: 0,
        duration: Date.now() - startTime,
        errors: [],
      };
    }

    batchRepo.startProcessing(batchId);

    const items = incompleteItems
      .map((item) => ({
        id: item.id,
        batchId: item.batchId,
        path: item.filePath,
        sha256: item.sourceSha256 || '',
        format: this.detectFormatFromPath(item.filePath),
      }))
      .filter((item): item is { id: string; batchId: string; path: string; sha256: string; format: EbookFormat } => item.format !== null);

    try {
      const results = await this.processBatches(batchId, items, batchLogger);
      const duration = Date.now() - startTime;

      batchLogger.info('Indexing resumed and completed', { batchId, duration, results });
      batchRepo.complete(batchId);

      return {
        batchId,
        status: 'completed',
        resumed: true,
        totalBooks: batch.totalBooks,
        processedBooks: batch.processedBooks + results.processed,
        failedBooks: results.failed,
        duration,
        errors: results.errors,
      };
    } catch (error) {
      batchLogger.error('Resumed indexing failed', error as Error);
      batchRepo.fail(batchId);

      return {
        batchId,
        status: 'failed',
        resumed: true,
        totalBooks: batch.totalBooks,
        processedBooks: batch.processedBooks,
        failedBooks: batch.failedBooks,
        duration: Date.now() - startTime,
        errors: [(error as Error).message],
      };
    }
  }

  private async startNewBatch(startTime: number): Promise<BatchProcessorResult> {
    const batchId = generateBatchId();
    const batchLogger = createBatchLogger(batchId);

    batchLogger.info('Starting new indexing batch', { batchId });

    try {
      batchRepo.create({
        id: batchId,
        totalBooks: 0,
      });

      batchRepo.startProcessing(batchId);

      const crawlResult = await fileCrawler.crawl();
      const newFiles = await this.filterNewFiles(crawlResult.files);

      batchLogger.info('Crawl complete', {
        totalFiles: crawlResult.files.length,
        newFiles: newFiles.length,
      });

      if (newFiles.length === 0) {
        batchRepo.complete(batchId);
        return {
          batchId,
          status: 'completed',
          resumed: false,
          totalBooks: 0,
          processedBooks: 0,
          failedBooks: 0,
          duration: Date.now() - startTime,
          errors: ['No new files to process'],
        };
      }

      const batchItems = this.createBatchItems(batchId, newFiles);
      batchRepo.update(batchId, { totalBooks: batchItems.length });

      const results = await this.processBatches(batchId, batchItems, batchLogger);

      const duration = Date.now() - startTime;
      batchLogger.info('Indexing completed', { batchId, duration, results });

      batchRepo.complete(batchId);

      return {
        batchId,
        status: 'completed',
        resumed: false,
        totalBooks: results.total,
        processedBooks: results.processed,
        failedBooks: results.failed,
        duration,
        errors: results.errors,
      };
    } catch (error) {
      batchLogger.error('Indexing failed', error as Error);
      batchRepo.fail(batchId);

      return {
        batchId,
        status: 'failed',
        resumed: false,
        totalBooks: 0,
        processedBooks: 0,
        failedBooks: 0,
        duration: Date.now() - startTime,
        errors: [(error as Error).message],
      };
    }
  }

  private detectFormatFromPath(filePath: string): EbookFormat | null {
    const ext = filePath.toLowerCase().split('.').pop();
    const formats: Record<string, EbookFormat> = {
      epub: 'epub',
      mobi: 'mobi',
      pdf: 'pdf',
      azw: 'azw',
      azw3: 'azw3',
    };
    return ext ? formats[ext] || null : null;
  }

  private async filterNewFiles(
    files: Array<{ path: string; sha256: string; format: EbookFormat; size: number }>
  ): Promise<Array<{ path: string; sha256: string; format: EbookFormat; size: number }>> {
    const newFiles: typeof files = [];

    for (const file of files) {
      const existing = fileRepo.findBySha256(file.sha256);
      if (!existing) {
        newFiles.push(file);
      }
    }

    return newFiles;
  }

  private createBatchItems(
    batchId: string,
    files: Array<{ path: string; sha256: string; format: EbookFormat; size: number }>
  ): Array<{ id: string; batchId: string; path: string; sha256: string; format: EbookFormat }> {
    const items = files.map((file) => ({
      id: generateBatchItemId(),
      batchId,
      path: file.path,
      sha256: file.sha256,
      format: file.format,
    }));

    for (const item of items) {
      batchRepo.createItem({
        id: item.id,
        batchId: item.batchId,
        filePath: item.path,
        sourceSha256: item.sha256,
      });
    }

    return items;
  }

  private async processBatches(
    batchId: string,
    items: Array<{
      id: string;
      batchId: string;
      path: string;
      sha256: string;
      format: EbookFormat;
    }>,
    batchLogger: ReturnType<typeof createBatchLogger>
  ): Promise<{ total: number; processed: number; failed: number; errors: string[] }> {
    const results = { total: items.length, processed: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < items.length; i += this.batchSize) {
      const batchItems = items.slice(i, i + this.batchSize);
      batchLogger.info(`Processing batch ${Math.floor(i / this.batchSize) + 1}`, {
        start: i,
        end: Math.min(i + this.batchSize, items.length),
        count: batchItems.length,
      });

      try {
        await this.processSingleBatch(batchId, batchItems, batchLogger);
        results.processed += batchItems.length;
      } catch (error) {
        results.failed += batchItems.length;
        results.errors.push((error as Error).message);
        batchLogger.error('Batch failed', error as Error, { batchIndex: i });
        batchRepo.fail(batchId);
        throw error;
      }

      batchRepo.update(batchId, { processedBooks: results.processed });
    }

    return results;
  }

  private async processSingleBatch(
    batchId: string,
    items: Array<{ id: string; path: string; sha256: string; format: EbookFormat }>,
    batchLogger: ReturnType<typeof createBatchLogger>,
    fastMode: boolean = false
  ): Promise<void> {
    batchLogger.info('Phase 1: Name Resolution STARTING', { itemCount: items.length });

    const nameResults = await nameResolverAgent.execute({
      batchId,
      files: items.map((item) => ({
        id: item.id,
        path: item.path,
        sha256: item.sha256,
        format: item.format,
      })),
    });
    batchLogger.info('Phase 1: Name Resolution COMPLETED', { resultCount: nameResults.length });

    if (!fastMode) {
      const groupedByName = this.groupByNameResults(nameResults);

      batchLogger.info('Phase 2a: Image Resolution STARTING', {
        authorCount: groupedByName.authors.size,
        bookCount: groupedByName.books.length,
      });

      await imageResolverAgent.execute({
        batchId,
        authors: Array.from(groupedByName.authors.values()),
        books: groupedByName.books,
      });
      batchLogger.info('Phase 2a: Image Resolution COMPLETED');

      batchLogger.info('Phase 2b: Persisting to database STARTING');
      const persistResults = await this.persistToDatabaseWithTracking(batchId, nameResults, batchLogger);
      batchLogger.info('Phase 2b: Persisting to database COMPLETED', {
        successful: persistResults.successful.length,
        failed: persistResults.failed.length,
      });

      if (persistResults.successful.length > 0) {
        batchLogger.info('Phase 2c: Moving processed files STARTING', {
          fileCount: persistResults.successful.length,
        });
        await this.moveProcessedFiles(persistResults.successful, batchLogger);
        batchLogger.info('Phase 2c: Moving processed files COMPLETED');
      }

      for (const result of persistResults.successful) {
        const item = items.find((i) => i.path === result.filePath);
        if (item) {
          await batchRepo.updateItemStatus(item.id, 'persisted');
        }
      }

      for (const result of persistResults.failed) {
        const item = items.find((i) => i.path === result.filePath);
        if (item) {
          await batchRepo.updateItemStatus(item.id, 'failed', undefined, result.error);
        }
      }

      const successfulNameResults = nameResults.filter((r) =>
        persistResults.successful.some((s) => s.filePath === r.filePath)
      );

      if (successfulNameResults.length > 0) {
        const successfulGrouped = this.groupByNameResults(successfulNameResults);

        batchLogger.info('Phase 3: Metadata Resolution STARTING');
        try {
          await metadataResolverAgent.execute({
            batchId,
            authors: Array.from(successfulGrouped.authors.values()),
            books: successfulGrouped.books.map((b) => ({
              title: b.originalTitle,
              englishTitle: b.englishTitle,
              authorName: b.authorName,
              authorSlug: b.authorSlug,
              bookSlug: b.bookSlug,
            })),
            series: successfulGrouped.series,
          });
          batchLogger.info('Phase 3: Metadata Resolution COMPLETED');
        } catch (error) {
          batchLogger.error('Phase 3: Metadata Resolution FAILED (non-blocking)', error as Error);
        }

        batchLogger.info('Phase 4: File conversion STARTING');
        try {
          await this.convertFiles(successfulNameResults, batchLogger);
          batchLogger.info('Phase 4: File Conversion COMPLETED');
        } catch (error) {
          batchLogger.error('Phase 4: File Conversion FAILED (non-blocking)', error as Error);
        }
      }
    } else {
      await this.persistToDatabase(batchId, nameResults, batchLogger);
    }

    for (const item of items) {
      const itemStatus = await batchRepo.findItemById(item.id);
      if (itemStatus && itemStatus.status !== 'failed') {
        await batchRepo.updateItemStatus(item.id, 'completed');
      }
    }
  }

  private groupByNameResults(results: NameResolverAgentResult[]): {
    authors: Map<string, { name: string; slug: string }>;
    books: Array<{
      title: string;
      originalTitle: string;
      englishTitle: string;
      authorName: string;
      authorSlug: string;
      bookSlug: string;
      seriesSlug: string;
    }>;
    series: Array<{ name: string; englishName: string; authorName: string; authorSlug: string }>;
  } {
    const authors = new Map<string, { name: string; slug: string }>();
    const books: Array<{
      title: string;
      originalTitle: string;
      englishTitle: string;
      authorName: string;
      authorSlug: string;
      bookSlug: string;
      seriesSlug: string;
    }> = [];
    const series: Array<{
      name: string;
      englishName: string;
      authorName: string;
      authorSlug: string;
    }> = [];

    for (const result of results) {
      const authorKey = result.author.slug;
      if (!authors.has(authorKey)) {
        authors.set(authorKey, {
          name: result.author.normalizedName,
          slug: result.author.slug,
        });
      }

      books.push({
        title: result.title.englishTitle,
        originalTitle: result.title.originalTitle,
        englishTitle: result.title.englishTitle,
        authorName: result.author.normalizedName,
        authorSlug: result.author.slug,
        bookSlug: result.title.slug,
        seriesSlug: result.series.slug || '',
      });

      if (result.series.slug) {
        const seriesKey = `${result.author.slug}/${result.series.slug}`;
        const existing = series.find((s) => `${s.authorSlug}/${s.englishName}` === seriesKey);
        if (!existing) {
          series.push({
            name: result.series.originalName!,
            englishName: result.series.englishName!,
            authorName: result.author.normalizedName,
            authorSlug: result.author.slug,
          });
        }
      }
    }

    return { authors, books, series };
  }

  private async persistToDatabase(
    batchId: string,
    nameResults: NameResolverAgentResult[],
    batchLogger: ReturnType<typeof createBatchLogger>
  ): Promise<void> {
    const processedAuthors = new Set<string>();
    const processedSeries = new Set<string>();
    const processedBooks = new Set<string>();
    const authorIdMap = new Map<string, string>();
    const seriesIdMap = new Map<string, string>();
    const bookIdMap = new Map<string, string>();

    for (const result of nameResults) {
      const authorSlug = result.author.slug;

      if (!processedAuthors.has(authorSlug)) {
        const existingAuthor = authorRepo.findBySlug(authorSlug);

        if (!existingAuthor) {
          const authorId = generateAuthorId();
          authorIdMap.set(authorSlug, authorId);
          authorRepo.create({
            id: authorId,
            name: result.author.normalizedName,
            slug: result.author.slug,
          });
          batchLogger.debug('Created author', { name: result.author.normalizedName, id: authorId });
        } else {
          authorIdMap.set(authorSlug, existingAuthor.id);
        }
        processedAuthors.add(authorSlug);
      }

      const authorId = authorIdMap.get(authorSlug)!;
      let seriesId: string | null = null;
      if (result.series.slug) {
        const seriesKey = `${authorSlug}/${result.series.slug}`;

        if (!processedSeries.has(seriesKey)) {
          const existingSeries = seriesRepo.findBySlug(result.series.slug);

          if (!existingSeries) {
            seriesId = generateSeriesId();
            seriesIdMap.set(seriesKey, seriesId);
            seriesRepo.create({
              id: seriesId,
              name: result.series.englishName!,
              originalName: result.series.originalName,
              slug: result.series.slug,
              authorId,
            });
            batchLogger.debug('Created series', { name: result.series.englishName, id: seriesId });
          } else {
            seriesIdMap.set(seriesKey, existingSeries.id);
          }
          processedSeries.add(seriesKey);
        }
        seriesId = seriesIdMap.get(seriesKey)!;
      }

      const bookKey = `${authorSlug}/${result.title.slug}`;

      if (!processedBooks.has(bookKey)) {
        const bookId = generateBookId();
        bookIdMap.set(bookKey, bookId);
        bookRepo.create({
          id: bookId,
          title: result.title.englishTitle,
          originalTitle: result.title.originalTitle,
          slug: result.title.slug,
          authorId,
          seriesId,
        });
        batchLogger.debug('Created book', { title: result.title.englishTitle, id: bookId });
        processedBooks.add(bookKey);
      }

      const bookId = bookIdMap.get(bookKey)!;
      fileRepo.create({
        id: generateFileId(),
        bookId,
        type: 'book',
        format: result.format,
        path: result.filePath,
        sha256: result.sha256,
      });

      await fileOrganizer.copyFile(
        result.filePath,
        result.author.slug,
        result.title.slug,
        result.sha256,
        result.format
      );
    }
  }

  private async persistToDatabaseWithTracking(
    batchId: string,
    nameResults: NameResolverAgentResult[],
    batchLogger: ReturnType<typeof createBatchLogger>
  ): Promise<PersistResult> {
    const result: PersistResult = {
      successful: [],
      failed: [],
    };

    const processedAuthors = new Set<string>();
    const processedSeries = new Set<string>();
    const processedBooks = new Set<string>();
    const authorIdMap = new Map<string, string>();
    const seriesIdMap = new Map<string, string>();
    const bookIdMap = new Map<string, string>();

    for (const nameResult of nameResults) {
      try {
        const authorSlug = nameResult.author.slug;

        if (!processedAuthors.has(authorSlug)) {
          const existingAuthor = authorRepo.findBySlug(authorSlug);

          if (!existingAuthor) {
            const authorId = generateAuthorId();
            authorIdMap.set(authorSlug, authorId);
            authorRepo.create({
              id: authorId,
              name: nameResult.author.normalizedName,
              slug: nameResult.author.slug,
            });
            batchLogger.debug('Created author', { name: nameResult.author.normalizedName, id: authorId });
          } else {
            authorIdMap.set(authorSlug, existingAuthor.id);
          }
          processedAuthors.add(authorSlug);
        }

        const authorId = authorIdMap.get(authorSlug)!;
        let seriesId: string | null = null;
        if (nameResult.series.slug) {
          const seriesKey = `${authorSlug}/${nameResult.series.slug}`;

          if (!processedSeries.has(seriesKey)) {
            const existingSeries = seriesRepo.findBySlug(nameResult.series.slug);

            if (!existingSeries) {
              seriesId = generateSeriesId();
              seriesIdMap.set(seriesKey, seriesId);
              seriesRepo.create({
                id: seriesId,
                name: nameResult.series.englishName!,
                originalName: nameResult.series.originalName,
                slug: nameResult.series.slug,
                authorId,
              });
              batchLogger.debug('Created series', { name: nameResult.series.englishName, id: seriesId });
            } else {
              seriesIdMap.set(seriesKey, existingSeries.id);
            }
            processedSeries.add(seriesKey);
          }
          seriesId = seriesIdMap.get(seriesKey)!;
        }

        const bookKey = `${authorSlug}/${nameResult.title.slug}`;

        if (!processedBooks.has(bookKey)) {
          const bookId = generateBookId();
          bookIdMap.set(bookKey, bookId);
          bookRepo.create({
            id: bookId,
            title: nameResult.title.englishTitle,
            originalTitle: nameResult.title.originalTitle,
            slug: nameResult.title.slug,
            authorId,
            seriesId,
          });
          batchLogger.debug('Created book', { title: nameResult.title.englishTitle, id: bookId });
          processedBooks.add(bookKey);
        }

        const bookId = bookIdMap.get(bookKey)!;
        fileRepo.create({
          id: generateFileId(),
          bookId,
          type: 'book',
          format: nameResult.format,
          path: nameResult.filePath,
          sha256: nameResult.sha256,
        });

        await fileOrganizer.copyFile(
          nameResult.filePath,
          nameResult.author.slug,
          nameResult.title.slug,
          nameResult.sha256,
          nameResult.format
        );

        result.successful.push({ filePath: nameResult.filePath });
      } catch (error) {
        const errorMessage = (error as Error).message;
        batchLogger.error('Failed to persist item', error as Error, {
          filePath: nameResult.filePath,
        });
        result.failed.push({
          filePath: nameResult.filePath,
          error: errorMessage,
        });
      }
    }

    return result;
  }

  private async moveProcessedFiles(
    successfulItems: Array<{ filePath: string }>,
    batchLogger: ReturnType<typeof createBatchLogger>
  ): Promise<void> {
    const filePaths = successfulItems.map((item) => item.filePath);
    const sourceBaseDir = config.paths.source;
    const processedDir = config.paths.processed;

    try {
      const results = await fileOrganizer.moveProcessedFiles(
        filePaths,
        sourceBaseDir,
        processedDir
      );

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      batchLogger.info('Files moved to processed folder', {
        total: filePaths.length,
        successful: successful.length,
        failed: failed.length,
      });

      for (const failure of failed) {
        batchLogger.warn('Failed to move file to processed folder', {
          originalPath: failure.originalPath,
          error: failure.error,
        });
      }

      if (successful.length > 0) {
        const authorSlugs = [
          ...new Set(
            successful
              .filter((r) => r.originalPath)
              .map((r) => {
                const parts = r.originalPath.replace(/\\/g, '/').split('/');
                const sourceIndex = parts.indexOf('source');
                return sourceIndex >= 0 && parts.length > sourceIndex + 1 ? parts[sourceIndex + 1] : null;
              })
              .filter((slug): slug is string => slug !== null)
          ),
        ];

        if (authorSlugs.length > 0) {
          const cleanupResult = await fileOrganizer.cleanEmptyFolders(authorSlugs, sourceBaseDir);
          if (cleanupResult.cleaned.length > 0) {
            batchLogger.info('Cleaned empty author folders', {
              count: cleanupResult.cleaned.length,
              slugs: cleanupResult.cleaned,
            });
          }
        }
      }
    } catch (error) {
      batchLogger.error('Batch file move failed', error as Error, {
        fileCount: filePaths.length,
      });
    }
  }

  private async convertFiles(
    results: NameResolverAgentResult[],
    batchLogger: ReturnType<typeof createBatchLogger>
  ): Promise<void> {
    const booksBySlug = new Map<string, NameResolverAgentResult[]>();

    for (const result of results) {
      const key = `${result.author.slug}/${result.title.slug}`;
      if (!booksBySlug.has(key)) {
        booksBySlug.set(key, []);
      }
      booksBySlug.get(key)!.push(result);
    }

    for (const [bookKey, files] of booksBySlug) {
      const [authorSlug, bookSlug] = bookKey.split('/');
      const sha256 = files[0].sha256;
      const formats = files.map((f) => f.format);

      const conversionResults = await fileOrganizer.convertBook(
        authorSlug,
        bookSlug,
        sha256,
        formats
      );

      const author = authorRepo.findBySlug(authorSlug);
      if (!author) {
        batchLogger.warn('Author not found for converted file', { authorSlug });
        continue;
      }

      const book = bookRepo.findBySlugAndAuthor(bookSlug, author.id);
      if (!book) {
        batchLogger.warn('Book not found for converted file', { bookSlug, authorSlug });
        continue;
      }

      for (const [format, result] of conversionResults) {
        if (result.success && result.path) {
          fileRepo.create({
            id: generateFileId(),
            bookId: book.id,
            type: 'book',
            format,
            path: result.path,
            sha256,
          });
          batchLogger.debug('Created converted file', { format, path: result.path });
        } else if (result.error) {
          batchLogger.warn('Conversion failed (non-critical)', {
            format,
            error: result.error,
          });
        }
      }
    }
  }

  async rollback(batchId: string): Promise<void> {
    const batchLogger = createBatchLogger(batchId);
    batchLogger.info('Starting rollback', { batchId });

    const batch = batchRepo.findById(batchId);
    if (!batch) {
      batchLogger.warn('Batch not found for rollback', { batchId });
      return;
    }

    batchLogger.info('Rollback completed', { batchId });
    batchRepo.markRolledBack(batchId);
  }

  getStatus(batchId: string): IndexingProgress | null {
    const batch = batchRepo.findById(batchId);
    if (!batch) return null;

    const items = batchRepo.findItemsByBatchId(batchId);
    const latestItem = items[items.length - 1];

    return {
      batchId: batch.id,
      status: batch.status,
      totalBooks: batch.totalBooks,
      processedBooks: batch.processedBooks,
      failedBooks: batch.failedBooks,
      currentPhase: latestItem?.status || 'pending',
    };
  }
}

export const batchProcessor = new BatchProcessor();
