import Groq from 'groq-sdk';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { withRetry, isRetryableError } from '../utils/retry.js';
import type {
  NameResolverInput,
  NameResolverItemOutput,
  MetadataResolverInput,
  MetadataResolverOutput,
} from '../types/groq.js';

class GroqService {
  private client: Groq;
  private model: string;
  private timeout: number;

  constructor() {
    this.client = new Groq({
      apiKey: config.groq.apiKey,
    });
    this.model = config.groq.model;
    this.timeout = config.groq.timeout;
  }

  private async callWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    return withRetry(fn, {
      maxRetries: config.retry.maxRetries,
      baseDelay: config.retry.baseDelay,
      shouldRetry: isRetryableError,
      onRetry: (attempt, error) => {
        logger.warn(`Groq API call failed, retrying`, {
          attempt,
          error: error.message,
        });
      },
    });
  }

  private buildSystemPrompt(role: string): string {
    return `You are ${role}. You MUST respond with valid JSON only. No markdown, no code blocks, no explanation. Just pure JSON that can be parsed directly.`;
  }

  private async callAgent<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    logger.info('Groq API call starting', { promptLength: userPrompt.length });
    const startTime = Date.now();

    const completion = await this.callWithRetry(() =>
      this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      })
    );

    const elapsed = Date.now() - startTime;
    logger.info('Groq API call completed', { elapsedMs: elapsed });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from Groq API');
    }

    try {
      return JSON.parse(content) as T;
    } catch (error) {
      logger.error('Failed to parse Groq response', error as Error, {
        content: content.substring(0, 500),
      });
      throw new Error(`Invalid JSON response from Groq: ${(error as Error).message}`);
    }
  }

  async resolveNames(inputs: NameResolverInput[]): Promise<NameResolverItemOutput[]> {
    const systemPrompt = this.buildSystemPrompt(
      'a highly specialized book name resolver service. You analyze file paths and names to extract author names, book titles, and the book series name information if applicable. You handle multilingual content (German, French, Spanish and others) and normalize names to English where possible. You always provide confidence scores between 0.0 and 1.0.'
    );

    const userPrompt = `Analyze these ebook file paths and extract book information.

INPUT FILES:
${JSON.stringify(inputs, null, 2)}

RESPONSE FORMAT (JSON array):
{
  "results": [
    {
      "filePath": "original file path",
      "confidence": 0.95,
      "author": {
        "name": "Corrected Author Name",
        "confidence": 0.98
      },
      "title": {
        "original": "Original Title (might be in different language)",
        "english": "English Title",
        "confidence": 0.95
      },
      "series": {
        "name": "Series Name in Original Language or null",
        "englishName": "Series Name in English or null",
        "confidence": 0.8
      }
    }
  ]
}

RULES:
1. Extract author name from path or filename, correct spelling if needed
2. Extract original title (may be in Czech, German, etc.)
3. Provide English translation of title if original is non-English
4. Detect series information if applicable
5. Provide confidence score (0.0-1.0) for each field
6. If uncertain, use confidence < 0.5
7. Fallback: "Unknown Author" for author, use filename for title if unclear
8. Always return valid JSON matching the exact schema`;

    const response = await this.callAgent<{ results: NameResolverItemOutput[] }>(
      systemPrompt,
      userPrompt
    );

    logger.info('=== STEP 1: NAME RESOLUTION - GROQ RESPONSE ===', {
      inputCount: inputs.length,
      outputCount: response.results.length,
      results: response.results.map((r) => ({
        filePath: r.filePath,
        author: r.author,
        title: r.title,
        series: r.series,
        confidence: r.confidence,
      })),
    });
    return response.results;
  }

  async resolveMetadata(input: MetadataResolverInput): Promise<MetadataResolverOutput> {
    const systemPrompt = this.buildSystemPrompt(
      'a highly specialized book metadata service. You provide detailed metadata for authors, books, and series including biographical information, book descriptions, ISBNs, publication years, and series descriptions. All descriptions must be in English.'
    );

    const userPrompt = `Find metadata for these authors, books, and series.

INPUT:
${JSON.stringify(input, null, 2)}

RESPONSE FORMAT (JSON):
{
  "authors": [
    {
      "name": "Author Name",
      "bio": "Short biographical description in English (2-3 sentences)",
      "nationality": "Country name",
      "dateOfBirth": "YYYY-MM-DD or null",
      "openLibraryKey": "OL... or null"
    }
  ],
  "books": [
    {
      "author": "Author Name",
      "title": "Book Title",
      "description": "Short description in English (2-3 sentences)",
      "isbn": "ISBN-13 or null",
      "firstPublishYear": 1986 or null
    }
  ],
  "series": [
    {
      "author": "Author Name",
      "name": "Series Name",
      "description": "Short description of the series in English"
    }
  ]
}

RULES:
1. All descriptions must be in English
2. Bio should be 2-3 sentences max
3. Book description should be 2-3 sentences max
4. ISBN should be ISBN-13 format if available
5. Use null for unknown fields
6. Open Library key format: OL followed by numbers and A/M/W
7. Always return valid JSON`;

    const response = await this.callAgent<MetadataResolverOutput>(systemPrompt, userPrompt);

    logger.info('=== STEP 3: METADATA RESOLUTION - GROQ RESPONSE ===', {
      inputAuthors: input.authors.length,
      inputBooks: input.books.length,
      inputSeries: input.series.length,
      outputAuthors: response.authors.length,
      outputBooks: response.books.length,
      outputSeries: response.series.length,
      authors: response.authors.map((a) => ({
        name: a.name,
        bio: a.bio?.substring(0, 100) + '...',
        nationality: a.nationality,
        dateOfBirth: a.dateOfBirth,
        openLibraryKey: a.openLibraryKey,
      })),
      books: response.books.map((b) => ({
        author: b.author,
        title: b.title,
        description: b.description?.substring(0, 100) + '...',
        isbn: b.isbn,
        firstPublishYear: b.firstPublishYear,
      })),
      series: response.series.map((s) => ({
        author: s.author,
        name: s.name,
        description: s.description?.substring(0, 100) + '...',
      })),
    });
    return response;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      logger.error('Groq API connection test failed', error as Error);
      return false;
    }
  }
}

export const groqService = new GroqService();
