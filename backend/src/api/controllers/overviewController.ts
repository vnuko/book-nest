import type { Request, Response, NextFunction } from 'express';
import { authorRepo, bookRepo, seriesRepo, fileRepo } from '../../db/repositories/index.js';

interface OverviewAuthor {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  bookCount: number;
}

interface OverviewBook {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  seriesId: string | null;
  seriesName: string | null;
  description: string | null;
  coverUrl: string;
  files: Array<{ id: string; format: string; size: number }>;
}

interface OverviewSeries {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  bookCount: number;
}

interface OverviewResponse {
  popularAuthors: OverviewAuthor[];
  trendingBooks: OverviewBook[];
  featuredSeries: OverviewSeries[];
}

async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = 5;

    const popularAuthorsData = authorRepo.findPopular(limit);
    const trendingBooksData = bookRepo.findRecent(limit);
    const featuredSeriesData = seriesRepo.findFeatured(limit);

    const popularAuthors: OverviewAuthor[] = popularAuthorsData.map((author) => ({
      id: author.id,
      name: author.name,
      bio: author.bio,
      avatarUrl: null,
      bookCount: author.bookCount,
    }));

    const trendingBooks: OverviewBook[] = await Promise.all(
      trendingBooksData.map(async (book) => {
        const author = authorRepo.findById(book.authorId);
        const series = book.seriesId ? seriesRepo.findById(book.seriesId) : null;
        const files = fileRepo
          .findByBookId(book.id)
          .filter((f) => f.type === 'book')
          .map((f) => ({ id: f.id, format: f.format, size: f.size ?? 0 }));

        return {
          id: book.id,
          title: book.title,
          authorId: book.authorId,
          authorName: author?.name ?? 'Unknown',
          seriesId: book.seriesId,
          seriesName: series?.name ?? null,
          description: book.description,
          coverUrl: `/api/files/cover/${book.id}`,
          files,
        };
      })
    );

    const featuredSeries: OverviewSeries[] = featuredSeriesData.map((series) => ({
      id: series.id,
      name: series.name,
      description: series.description,
      coverUrl: null,
      bookCount: series.bookCount,
    }));

    const response: OverviewResponse = {
      popularAuthors,
      trendingBooks,
      featuredSeries,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

export const overviewController = {
  getOverview,
};
