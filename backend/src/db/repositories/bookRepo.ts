import { db } from '../index.js';
import type { Book, CreateBookInput } from '../../types/db.js';

const findByIdStmt = db.prepare<[{ id: string }], Book>(`
  SELECT * FROM books WHERE id = @id
`);

const findBySlugAndAuthorStmt = db.prepare<[{ slug: string; authorId: string }], Book>(`
  SELECT * FROM books WHERE slug = @slug AND authorId = @authorId
`);

const findByAuthorIdStmt = db.prepare<[{ authorId: string; limit: number; offset: number }], Book>(`
  SELECT * FROM books WHERE authorId = @authorId ORDER BY seriesOrder, title LIMIT @limit OFFSET @offset
`);

const findBySeriesIdStmt = db.prepare<[{ seriesId: string }], Book>(`
  SELECT * FROM books WHERE seriesId = @seriesId ORDER BY seriesOrder, title
`);

const findAllStmt = db.prepare<[{ limit: number; offset: number }], Book>(`
  SELECT * FROM books ORDER BY title LIMIT @limit OFFSET @offset
`);

const searchStmt = db.prepare<[{ query: string; limit: number }], Book>(`
  SELECT b.* FROM books b
  JOIN authors a ON b.authorId = a.id
  WHERE b.title LIKE @query OR a.name LIKE @query
  ORDER BY b.title
  LIMIT @limit
`);

const createStmt = db.prepare<
  [
    Omit<
      CreateBookInput,
      'originalTitle' | 'seriesId' | 'seriesOrder' | 'description' | 'firstPublishYear' | 'liked'
    > & {
      originalTitle: string | null;
      seriesId: string | null;
      seriesOrder: number | null;
      description: string | null;
      firstPublishYear: number | null;
      liked: number;
    },
  ],
  Book
>(`
  INSERT INTO books (id, title, originalTitle, slug, authorId, seriesId, seriesOrder, description, firstPublishYear, liked)
  VALUES (@id, @title, @originalTitle, @slug, @authorId, @seriesId, @seriesOrder, @description, @firstPublishYear, @liked)
  RETURNING *
`);

const updateStmt = db.prepare<
  [
    {
      id: string;
      title?: string;
      originalTitle?: string | null;
      slug?: string;
      authorId?: string;
      seriesId?: string | null;
      seriesOrder?: number | null;
      description?: string | null;
      firstPublishYear?: number | null;
      liked?: number;
      updatedAt: string;
    },
  ],
  Book
>(`
  UPDATE books SET
    title = COALESCE(@title, title),
    originalTitle = COALESCE(@originalTitle, originalTitle),
    slug = COALESCE(@slug, slug),
    authorId = COALESCE(@authorId, authorId),
    seriesId = COALESCE(@seriesId, seriesId),
    seriesOrder = COALESCE(@seriesOrder, seriesOrder),
    description = COALESCE(@description, description),
    firstPublishYear = COALESCE(@firstPublishYear, firstPublishYear),
    liked = COALESCE(@liked, liked),
    updatedAt = @updatedAt
  WHERE id = @id
  RETURNING *
`);

const deleteStmt = db.prepare<[{ id: string }], { changes: number }>(`
  DELETE FROM books WHERE id = @id
`);

const countStmt = db.prepare<[], { count: number }>(`
  SELECT COUNT(*) as count FROM books
`);

const findRecentStmt = db.prepare<[{ limit: number }], Book>(`
  SELECT * FROM books ORDER BY createdAt DESC LIMIT @limit
`);

const toggleLikeStmt = db.prepare<[{ id: string; liked: number; updatedAt: string }], Book>(`
  UPDATE books SET liked = @liked, updatedAt = @updatedAt WHERE id = @id RETURNING *
`);

export const bookRepo = {
  findById(id: string): Book | undefined {
    return findByIdStmt.get({ id });
  },

  findBySlugAndAuthor(slug: string, authorId: string): Book | undefined {
    return findBySlugAndAuthorStmt.get({ slug, authorId });
  },

  findByAuthorId(authorId: string, limit: number, offset: number): Book[] {
    return findByAuthorIdStmt.all({ authorId, limit, offset });
  },

  findBySeriesId(seriesId: string): Book[] {
    return findBySeriesIdStmt.all({ seriesId });
  },

  findAll(limit: number, offset: number): Book[] {
    return findAllStmt.all({ limit, offset });
  },

  search(query: string, limit: number): Book[] {
    return searchStmt.all({ query: `%${query}%`, limit });
  },

  create(input: CreateBookInput): Book {
    return createStmt.get({
      id: input.id,
      title: input.title,
      originalTitle: input.originalTitle ?? null,
      slug: input.slug,
      authorId: input.authorId,
      seriesId: input.seriesId ?? null,
      seriesOrder: input.seriesOrder ?? null,
      description: input.description ?? null,
      firstPublishYear: input.firstPublishYear ?? null,
      liked: input.liked ? 1 : 0,
    })!;
  },

  update(id: string, input: Partial<Omit<CreateBookInput, 'id'>>): Book {
    return updateStmt.get({
      id,
      title: input.title,
      originalTitle: input.originalTitle,
      slug: input.slug,
      authorId: input.authorId,
      seriesId: input.seriesId,
      seriesOrder: input.seriesOrder,
      description: input.description,
      firstPublishYear: input.firstPublishYear,
      liked: input.liked !== undefined ? (input.liked ? 1 : 0) : undefined,
      updatedAt: new Date().toISOString(),
    })!;
  },

  delete(id: string): boolean {
    const result = deleteStmt.run({ id });
    return result.changes > 0;
  },

  count(): number {
    return countStmt.get()!.count;
  },

  findRecent(limit: number): Book[] {
    return findRecentStmt.all({ limit });
  },

  toggleLike(id: string, liked: boolean): Book | undefined {
    return toggleLikeStmt.get({
      id,
      liked: liked ? 1 : 0,
      updatedAt: new Date().toISOString(),
    });
  },
};
