import { aiService } from '../../services/aiService.js';
import { createBatchLogger } from '../../utils/logger.js';
import { batchRepo, authorRepo, bookRepo, seriesRepo } from '../../db/repositories/index.js';
import type {
  MetadataResolverAgentInput,
  MetadataResolverAgentResult,
  AuthorMetadata,
  BookMetadata,
  SeriesMetadata,
} from '../../types/agents.js';
import type { MetadataResolverOutput } from '../../types/ai.js';

class MetadataResolverAgent {
  async execute(input: MetadataResolverAgentInput): Promise<MetadataResolverAgentResult> {
    const batchLogger = createBatchLogger(input.batchId);
    batchLogger.info('Metadata Resolver Agent started', {
      authorCount: input.authors.length,
      bookCount: input.books.length,
      seriesCount: input.series.length,
      authors: input.authors.map((a) => a.name),
    });

    try {
      const aiInput = {
        authors: input.authors.map((a) => a.name),
        books: input.books.map((b) => ({ author: b.authorName, title: b.englishTitle })),
        series: input.series.map((s) => ({ author: s.authorName, name: s.englishName })),
      };

      const aiResults = await aiService.resolveMetadata(aiInput);

      batchLogger.info('AI metadata response received', {
        authorsReturned: aiResults.authors.length,
        booksReturned: aiResults.books.length,
        seriesReturned: aiResults.series.length,
        authorsWithBio: aiResults.authors.filter((a) => a.bio).length,
        booksWithDesc: aiResults.books.filter((b) => b.description).length,
        authorNames: aiResults.authors.map((a) => a.name),
      });

      const processedResults = this.processResults(input, aiResults, batchLogger);

      await this.storeResults(input.batchId, processedResults, batchLogger);

      batchLogger.info('Metadata Resolver Agent completed', {
        authors: processedResults.authors.size,
        books: processedResults.books.size,
        series: processedResults.series.size,
      });

      return processedResults;
    } catch (error) {
      batchLogger.error('Metadata Resolver Agent failed', error as Error);
      throw error;
    }
  }

  private processResults(
    input: MetadataResolverAgentInput,
    aiResults: MetadataResolverOutput,
    batchLogger: ReturnType<typeof createBatchLogger>,
  ): MetadataResolverAgentResult {
    const authors = new Map<string, AuthorMetadata>();
    const books = new Map<string, BookMetadata>();
    const series = new Map<string, SeriesMetadata>();

    for (const author of input.authors) {
      const aiAuthor = aiResults.authors.find(
        (a) => this.normalizeName(a.name) === this.normalizeName(author.name)
      );

      if (!aiAuthor) {
        batchLogger.warn('Author match failed', {
          inputName: author.name,
          availableNames: aiResults.authors.map((a) => a.name),
        });
      }

      authors.set(author.slug, {
        name: author.name,
        slug: author.slug,
        bio: aiAuthor?.bio || null,
        nationality: aiAuthor?.nationality || null,
        dateOfBirth: aiAuthor?.dateOfBirth || null,
        openLibraryKey: aiAuthor?.openLibraryKey || null,
      });
    }

    for (const book of input.books) {
      const aiBook = aiResults.books.find(
        (b) =>
          this.normalizeName(b.author) === this.normalizeName(book.authorName) &&
          this.normalizeTitle(b.title) === this.normalizeTitle(book.englishTitle)
      );

      if (!aiBook && aiResults.books.length > 0) {
        batchLogger.debug('Book match failed', {
          inputAuthor: book.authorName,
          inputTitle: book.englishTitle,
        });
      }

      books.set(`${book.authorSlug}/${book.bookSlug}`, {
        title: book.title,
        authorName: book.authorName,
        authorSlug: book.authorSlug,
        bookSlug: book.bookSlug,
        description: aiBook?.description || null,
        firstPublishYear: aiBook?.firstPublishYear || null,
      });
    }

    for (const s of input.series) {
      const aiSeries = aiResults.series.find(
        (ser) =>
          this.normalizeName(ser.author) === this.normalizeName(s.authorName) &&
          this.normalizeTitle(ser.name) === this.normalizeTitle(s.englishName)
      );

      const seriesKey = `${s.authorSlug}/${s.englishName}`;
      series.set(seriesKey, {
        name: s.name,
        englishName: s.englishName,
        authorName: s.authorName,
        authorSlug: s.authorSlug,
        description: aiSeries?.description || null,
      });
    }

    return { authors, books, series };
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[.']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async storeResults(
    batchId: string,
    results: MetadataResolverAgentResult,
    batchLogger: ReturnType<typeof createBatchLogger>,
  ): Promise<void> {
    let authorsUpdated = 0;
    let booksUpdated = 0;
    let seriesUpdated = 0;

    for (const [slug, author] of results.authors) {
      const existing = authorRepo.findBySlug(slug);
      if (existing) {
        if (author.bio) {
          authorRepo.update(existing.id, {
            bio: author.bio,
            nationality: author.nationality,
            dateOfBirth: author.dateOfBirth,
            openLibraryKey: author.openLibraryKey,
          });
          authorsUpdated++;
          batchLogger.debug('Updated author metadata', {
            slug,
            name: author.name,
            hasBio: !!author.bio,
          });
        } else {
          batchLogger.warn('Author has no bio to save', { slug, name: author.name });
        }
      } else {
        batchLogger.warn('Author not found in DB for metadata update', { slug });
      }
    }

    for (const [key, book] of results.books) {
      const [authorSlug] = key.split('/');
      const author = authorRepo.findBySlug(authorSlug);
      if (author) {
        const existing = bookRepo.findBySlugAndAuthor(book.bookSlug, author.id);
        if (existing) {
          if (book.description) {
            bookRepo.update(existing.id, {
              description: book.description,
              firstPublishYear: book.firstPublishYear,
            });
            booksUpdated++;
          } else {
            batchLogger.warn('Book has no description to save', {
              slug: book.bookSlug,
              title: book.title,
            });
          }
        }
      }
    }

    for (const [key, s] of results.series) {
      const [authorSlug] = key.split('/');
      const author = authorRepo.findBySlug(authorSlug);
      if (author) {
        const existing = seriesRepo.findByAuthorId(author.id).find(
          (ser) => ser.name === s.englishName || ser.originalName === s.name
        );
        if (existing && s.description) {
          seriesRepo.update(existing.id, {
            description: s.description,
          });
          seriesUpdated++;
        }
      }
    }

    batchLogger.info('Metadata saved to database', {
      authorsUpdated,
      booksUpdated,
      seriesUpdated,
    });

    const summary = {
      authorCount: results.authors.size,
      bookCount: results.books.size,
      seriesCount: results.series.size,
    };

    const items = batchRepo.findItemsByBatchId(batchId);

    for (const item of items) {
      const existingResults = item.agentResults ? JSON.parse(item.agentResults) : {};
      await batchRepo.updateItemStatus(
        item.id,
        'metadata_fetched',
        JSON.stringify({ ...existingResults, metadata: summary })
      );
    }
  }
}

export const metadataResolverAgent = new MetadataResolverAgent();
