import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { withRetry, isRetryableError } from '../utils/retry.js';
import type {
  NameResolverInput,
  NameResolverItemOutput,
  MetadataResolverInput,
  MetadataResolverOutput,
} from '../types/ai.js';

class AIService {
  private apiKey: string;
  private model: string;
  private timeout: number;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor() {
    this.apiKey = config.ai.apiKey;
    this.model = config.ai.model;
    this.timeout = config.ai.timeout;
  }

  private async callWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    return withRetry(fn, {
      maxRetries: config.retry.maxRetries,
      baseDelay: config.retry.baseDelay,
      shouldRetry: isRetryableError,
      onRetry: (attempt, error) => {
        logger.warn(`Gemini API call failed, retrying`, {
          attempt,
          error: error.message,
        });
      },
    });
  }

  private buildSystemPrompt(role: string): string {
    return `You are ${role}. You MUST respond with valid JSON only. No markdown, no code blocks, no explanation. Just pure JSON that can be parsed directly.`;
  }

  private truncate(text: string | null, maxLength: number): string | null {
    if (!text) return null;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private async callAI<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    logger.info('Gemini API call starting', { promptLength: userPrompt.length });
    const startTime = Date.now();

    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await this.callWithRetry(() =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: combinedPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 16384,
            responseMimeType: 'application/json',
          },
        }),
      })
    );

    const elapsed = Date.now() - startTime;
    logger.info('Gemini API call completed', { elapsedMs: elapsed });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      const finishReason = data.candidates?.[0]?.finishReason;
      logger.error('Empty or incomplete Gemini response', undefined, {
        finishReason,
        data: JSON.stringify(data).substring(0, 1000),
      });
      throw new Error(`Empty response from Gemini API (finishReason: ${finishReason})`);
    }

    try {
      return JSON.parse(content) as T;
    } catch (error) {
      logger.error('Failed to parse Gemini response', error as Error, {
        contentLength: content.length,
        contentStart: content.substring(0, 1000),
        contentEnd: content.substring(content.length - 500),
      });
      throw new Error(`Invalid JSON response from Gemini: ${(error as Error).message}`);
    }
  }

  async resolveNames(inputs: NameResolverInput[]): Promise<NameResolverItemOutput[]> {
    const systemPrompt = this.buildSystemPrompt(
      'a highly specialized book name resolver service. You analyze file paths and names to extract author names, book titles, and the book series name information if applicable. You handle multilingual content (German, French, Spanish and others) and normalize names to English where possible. You always provide confidence scores between 0.0 and 1.0.'
    );

    const userPrompt = `Analyze these ebook file paths and extract book information.

INPUT FILES:
${JSON.stringify(inputs, null, 2)}

RESPONSE FORMAT (JSON):
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

    const response = await this.callAI<{ results: NameResolverItemOutput[] }>(
      systemPrompt,
      userPrompt
    );

    response.results = response.results || [];

    logger.info('=== STEP 1: NAME RESOLUTION - AI RESPONSE ===', {
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
      "bio": "Short bio (MAX 300 characters)",
      "nationality": "Country",
      "dateOfBirth": "YYYY-MM-DD or null",
    }
  ],
  "books": [
    {
      "author": "Author Name",
      "title": "Book Title",
      "description": "Short description (MAX 500 characters)",
      "firstPublishYear": 1986 or null
    }
  ],
  "series": [
    {
      "author": "Author Name",
      "name": "Series Name",
      "description": "Short description (MAX 200 characters)"
    }
  ]
}

RULES:
1. Author bio: MAX 300 characters
2. Book description: MAX 500 characters
3. Series description: MAX 200 characters
4. Use null for unknown fields
5. Always return valid JSON matching the schema`;

    const response = await this.callAI<MetadataResolverOutput>(systemPrompt, userPrompt);

    response.authors = (response.authors || []).map((a) => ({
      ...a,
      bio: this.truncate(a.bio, 300),
    }));
    response.books = (response.books || []).map((b) => ({
      ...b,
      description: this.truncate(b.description, 500),
    }));
    response.series = (response.series || []).map((s) => ({
      ...s,
      description: this.truncate(s.description, 200),
    }));

    logger.info('=== STEP 3: METADATA RESOLUTION - AI RESPONSE ===', {
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
      const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Hello',
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 5,
          },
        }),
      });
      return response.ok;
    } catch (error) {
      logger.error('Gemini API connection test failed', error as Error);
      return false;
    }
  }
}

export const aiService = new AIService();
