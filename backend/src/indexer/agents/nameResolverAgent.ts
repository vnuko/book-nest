import { aiService } from '../../services/aiService.js';
import { logger, createBatchLogger } from '../../utils/logger.js';
import {
  slugifyAuthor,
  slugifyBook,
  slugifySeries,
  generateUniqueSlug,
} from '../../utils/index.js';
import { batchRepo } from '../../db/repositories/batchRepo.js';
import type {
  NameResolverAgentInput,
  NameResolverAgentResult,
  ResolvedAuthor,
  ResolvedTitle,
  ResolvedSeries,
} from '../../types/agents.js';
import type { NameResolverItemOutput } from '../../types/ai.js';

class NameResolverAgent {
  async execute(input: NameResolverAgentInput): Promise<NameResolverAgentResult[]> {
    const batchLogger = createBatchLogger(input.batchId);
    batchLogger.info('=== STEP 1: NAME RESOLUTION - STARTED ===', {
      fileCount: input.files.length,
      files: input.files.map((f) => ({ id: f.id, path: f.path, format: f.format })),
    });

    const aiInput = input.files.map((f) => ({ filePath: f.path }));
    batchLogger.info('=== STEP 1: SENDING TO AI SERVICE ===', { inputCount: aiInput.length });

    try {
      const results = await aiService.resolveNames(aiInput);

      const processedResults = this.processResults(input.files, results);

      await this.storeResults(input.batchId, processedResults);

      batchLogger.info('Name Resolver Agent completed', {
        successCount: processedResults.length,
        avgConfidence: this.calculateAverageConfidence(processedResults),
      });

      return processedResults;
    } catch (error) {
      batchLogger.error('Name Resolver Agent failed', error as Error);
      throw error;
    }
  }

  private processResults(
    files: NameResolverAgentInput['files'],
    aiResults: NameResolverItemOutput[]
  ): NameResolverAgentResult[] {
    const results: NameResolverAgentResult[] = [];
    const authorCache = new Map<string, ResolvedAuthor>();
    const bookSlugsByAuthor = new Map<string, Set<string>>();

    for (const file of files) {
      const aiResult = aiResults.find((r) => r.filePath === file.path);

      if (!aiResult) {
        logger.warn('No AI result for file', { filePath: file.path });
        continue;
      }

      const author = this.processAuthor(aiResult, authorCache);
      const title = this.processTitle(aiResult, author.slug, bookSlugsByAuthor);
      const series = this.processSeries(aiResult);

      results.push({
        fileId: file.id,
        filePath: file.path,
        sha256: file.sha256,
        format: file.format,
        author,
        title,
        series,
        overallConfidence: aiResult.confidence,
      });
    }

    return results;
  }

  private processAuthor(
    aiResult: NameResolverItemOutput,
    authorCache: Map<string, ResolvedAuthor>
  ): ResolvedAuthor {
    const originalName = aiResult.author.name;
    const normalizedName = this.normalizeAuthorName(originalName);

    if (authorCache.has(normalizedName)) {
      return authorCache.get(normalizedName)!;
    }

    const slug = slugifyAuthor(normalizedName);
    const author: ResolvedAuthor = {
      originalName,
      normalizedName,
      slug,
      confidence: aiResult.author.confidence,
    };
    authorCache.set(normalizedName, author);

    return author;
  }

  private processTitle(
    aiResult: NameResolverItemOutput,
    authorSlug: string,
    bookSlugsByAuthor: Map<string, Set<string>>
  ): ResolvedTitle {
    const originalTitle = aiResult.title.original;
    const englishTitle = aiResult.title.english || originalTitle;

    let existingSlugs = bookSlugsByAuthor.get(authorSlug);
    if (!existingSlugs) {
      existingSlugs = new Set<string>();
      bookSlugsByAuthor.set(authorSlug, existingSlugs);
    }

    let slug = slugifyBook(englishTitle);
    if (existingSlugs.has(slug)) {
      slug = generateUniqueSlug(slug, Array.from(existingSlugs));
    }
    existingSlugs.add(slug);

    return {
      originalTitle,
      englishTitle,
      slug,
      confidence: aiResult.title.confidence,
    };
  }

  private processSeries(aiResult: NameResolverItemOutput): ResolvedSeries {
    if (!aiResult.series?.name) {
      return {
        originalName: null,
        englishName: null,
        slug: null,
        confidence: 0,
      };
    }

    const originalName = aiResult.series.name;
    const englishName = aiResult.series.englishName || originalName;
    const slug = slugifySeries(englishName);

    return {
      originalName,
      englishName,
      slug,
      confidence: aiResult.series.confidence,
    };
  }

  private normalizeAuthorName(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  private async storeResults(batchId: string, results: NameResolverAgentResult[]): Promise<void> {
    for (const result of results) {
      await batchRepo.updateItemStatus(
        result.fileId,
        'name_resolved',
        JSON.stringify({
          author: result.author,
          title: result.title,
          series: result.series,
          overallConfidence: result.overallConfidence,
        })
      );
    }
  }

  private calculateAverageConfidence(results: NameResolverAgentResult[]): number {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + r.overallConfidence, 0);
    return Math.round((sum / results.length) * 100) / 100;
  }
}

export const nameResolverAgent = new NameResolverAgent();
