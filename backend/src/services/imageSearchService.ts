import { logger } from '../utils/logger.js';

interface OpenLibraryAuthorSearchResult {
  docs: Array<{
    key: string;
    name: string;
    birth_date?: string;
    photos?: number[];
    work_count?: number;
  }>;
}

interface OpenLibraryBookSearchResult {
  docs: Array<{
    key: string;
    title: string;
    cover_i?: number;
    cover_edition_key?: string;
  }>;
}

class ImageSearchService {
  async searchAuthorImage(
    authorName: string
  ): Promise<{ imageUrl: string | null; sourceKey: string | null }> {
    try {
      const encodedName = encodeURIComponent(authorName);
      const url = `https://openlibrary.org/search/authors.json?q=${encodedName}`;

      logger.info('=== STEP 2: Searching Open Library for author ===', {
        authorName,
        url,
      });

      const response = await fetch(url);
      if (!response.ok) {
        logger.warn('Open Library author search failed', {
          authorName,
          status: response.status,
        });
        return { imageUrl: null, sourceKey: null };
      }

      const data: OpenLibraryAuthorSearchResult = await response.json();

      if (data.docs && data.docs.length > 0) {
        const authorWithBirthDate = data.docs.find((a) => a.birth_date);
        const author = authorWithBirthDate || data.docs[0];

        if (authorWithBirthDate) {
          logger.info('=== STEP 2: Found author with birth_date (higher confidence) ===', {
            authorName,
            authorKey: author.key,
            birthDate: author.birth_date,
            workCount: author.work_count,
          });
        }

        if (author.photos && author.photos.length > 0) {
          const photoId = author.photos[0];
          const imageUrl = `https://covers.openlibrary.org/a/id/${photoId}-L.jpg`;

          logger.info('=== STEP 2: Author image found ===', {
            authorName,
            authorKey: author.key,
            photoId,
            imageUrl,
          });

          return { imageUrl, sourceKey: author.key };
        }

        if (author.key) {
          const imageUrl = `https://covers.openlibrary.org/a/olid/${author.key}-L.jpg`;

          logger.info('=== STEP 2: Author image URL (by key) ===', {
            authorName,
            authorKey: author.key,
            imageUrl,
          });

          return { imageUrl, sourceKey: author.key };
        }
      }

      logger.info('=== STEP 2: No author image found ===', { authorName });
      return { imageUrl: null, sourceKey: null };
    } catch (error) {
      logger.error('Author image search error', error as Error, { authorName });
      return { imageUrl: null, sourceKey: null };
    }
  }

  async searchBookCover(
    title: string,
    authorName?: string
  ): Promise<{ imageUrl: string | null; coverId: number | null; editionKey: string | null }> {
    try {
      let query = encodeURIComponent(title);
      if (authorName) {
        query = `${encodeURIComponent(title)}+${encodeURIComponent(authorName)}`;
      }
      const url = `https://openlibrary.org/search.json?q=${query}`;

      logger.info('=== STEP 2: Searching Open Library for book ===', {
        title,
        authorName,
        url,
      });

      const response = await fetch(url);
      if (!response.ok) {
        logger.warn('Open Library book search failed', {
          title,
          status: response.status,
        });
        return { imageUrl: null, coverId: null, editionKey: null };
      }

      const data: OpenLibraryBookSearchResult = await response.json();

      if (data.docs && data.docs.length > 0) {
        const book = data.docs[0];

        if (book.cover_i) {
          const imageUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;

          logger.info('=== STEP 2: Book cover found (by cover_i) ===', {
            title,
            coverId: book.cover_i,
            imageUrl,
          });

          return { imageUrl, coverId: book.cover_i, editionKey: book.cover_edition_key || null };
        }

        if (book.cover_edition_key) {
          const imageUrl = `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-L.jpg`;

          logger.info('=== STEP 2: Book cover URL (by edition key) ===', {
            title,
            editionKey: book.cover_edition_key,
            imageUrl,
          });

          return { imageUrl, coverId: null, editionKey: book.cover_edition_key };
        }
      }

      logger.info('=== STEP 2: No book cover found ===', { title, authorName });
      return { imageUrl: null, coverId: null, editionKey: null };
    } catch (error) {
      logger.error('Book cover search error', error as Error, { title, authorName });
      return { imageUrl: null, coverId: null, editionKey: null };
    }
  }

  async checkImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const imageSearchService = new ImageSearchService();
