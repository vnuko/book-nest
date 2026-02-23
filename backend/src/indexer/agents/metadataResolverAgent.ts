import { groqService } from '../../services/groqService.js';
import { createBatchLogger } from '../../utils/logger.js';
import { batchRepo } from '../../db/repositories/batchRepo.js';
import type {
  MetadataResolverAgentInput,
  MetadataResolverAgentResult,
  AuthorMetadata,
  BookMetadata,
  SeriesMetadata,
} from '../../types/agents.js';
import type { MetadataResolverOutput } from '../../types/groq.js';

class MetadataResolverAgent {
  async execute(input: MetadataResolverAgentInput): Promise<MetadataResolverAgentResult> {
    const batchLogger = createBatchLogger(input.batchId);
    batchLogger.info('Metadata Resolver Agent started', {
      authorCount: input.authors.length,
      bookCount: input.books.length,
      seriesCount: input.series.length,
    });

    try {
      const groqInput = {
        authors: input.authors.map((a) => a.name),
        books: input.books.map((b) => ({ author: b.authorName, title: b.englishTitle })),
        series: input.series.map((s) => ({ author: s.authorName, name: s.englishName })),
      };

      const groqResults = await groqService.resolveMetadata(groqInput);

      const processedResults = this.processResults(input, groqResults);

      await this.storeResults(input.batchId, processedResults);

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
    groqResults: MetadataResolverOutput,
  ): MetadataResolverAgentResult {
    const authors = new Map<string, AuthorMetadata>();
    const books = new Map<string, BookMetadata>();
    const series = new Map<string, SeriesMetadata>();

    for (const author of input.authors) {
      const groqAuthor = groqResults.authors.find((a) => a.name === author.name);

      authors.set(author.slug, {
        name: author.name,
        slug: author.slug,
        bio: groqAuthor?.bio || null,
        nationality: groqAuthor?.nationality || null,
        dateOfBirth: groqAuthor?.dateOfBirth || null,
        openLibraryKey: groqAuthor?.openLibraryKey || null,
      });
    }

    for (const book of input.books) {
      const groqBook = groqResults.books.find(
        (b) => b.author === book.authorName && b.title === book.englishTitle,
      );

      books.set(`${book.authorSlug}/${book.bookSlug}`, {
        title: book.title,
        authorName: book.authorName,
        authorSlug: book.authorSlug,
        bookSlug: book.bookSlug,
        description: groqBook?.description || null,
        isbn: groqBook?.isbn || null,
        firstPublishYear: groqBook?.firstPublishYear || null,
      });
    }

    for (const s of input.series) {
      const groqSeries = groqResults.series.find(
        (ser) => ser.author === s.authorName && ser.name === s.englishName,
      );

      const seriesKey = `${s.authorSlug}/${s.englishName}`;
      series.set(seriesKey, {
        name: s.name,
        englishName: s.englishName,
        authorName: s.authorName,
        authorSlug: s.authorSlug,
        description: groqSeries?.description || null,
      });
    }

    return { authors, books, series };
  }

  private async storeResults(
    batchId: string,
    results: MetadataResolverAgentResult,
  ): Promise<void> {
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
        JSON.stringify({ ...existingResults, metadata: summary }),
      );
    }
  }
}

export const metadataResolverAgent = new MetadataResolverAgent();
