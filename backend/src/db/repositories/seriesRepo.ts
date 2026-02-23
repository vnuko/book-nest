import { db } from '../index.js';
import type { Series, CreateSeriesInput } from '../../types/db.js';

const findByIdStmt = db.prepare<[{ id: string }], Series>(`
  SELECT * FROM series WHERE id = @id
`);

const findBySlugStmt = db.prepare<[{ slug: string }], Series>(`
  SELECT * FROM series WHERE slug = @slug
`);

const findByAuthorIdStmt = db.prepare<[{ authorId: string }], Series>(`
  SELECT * FROM series WHERE authorId = @authorId ORDER BY name
`);

const findAllStmt = db.prepare<[{ limit: number; offset: number }], Series>(`
  SELECT * FROM series ORDER BY name LIMIT @limit OFFSET @offset
`);

const searchStmt = db.prepare<[{ query: string; limit: number }], Series>(`
  SELECT * FROM series WHERE name LIKE @query ORDER BY name LIMIT @limit
`);

const createStmt = db.prepare<
  [
    Omit<CreateSeriesInput, 'originalName' | 'description'> & {
      originalName: string | null;
      description: string | null;
    },
  ],
  Series
>(`
  INSERT INTO series (id, name, originalName, slug, authorId, description)
  VALUES (@id, @name, @originalName, @slug, @authorId, @description)
  RETURNING *
`);

const updateStmt = db.prepare<
  [
    {
      id: string;
      name?: string;
      originalName?: string | null;
      slug?: string;
      authorId?: string;
      description?: string | null;
      updatedAt: string;
    },
  ],
  Series
>(`
  UPDATE series SET
    name = COALESCE(@name, name),
    originalName = COALESCE(@originalName, originalName),
    slug = COALESCE(@slug, slug),
    authorId = COALESCE(@authorId, authorId),
    description = COALESCE(@description, description),
    updatedAt = @updatedAt
  WHERE id = @id
  RETURNING *
`);

const deleteStmt = db.prepare<[{ id: string }], { changes: number }>(`
  DELETE FROM series WHERE id = @id
`);

const countStmt = db.prepare<[], { count: number }>(`
  SELECT COUNT(*) as count FROM series
`);

const findFeaturedStmt = db.prepare<[{ limit: number }], Series & { bookCount: number }>(`
  SELECT s.*, COUNT(b.id) as bookCount
  FROM series s
  LEFT JOIN books b ON s.id = b.seriesId
  GROUP BY s.id
  ORDER BY bookCount DESC, s.name ASC
  LIMIT @limit
`);

export const seriesRepo = {
  findById(id: string): Series | undefined {
    return findByIdStmt.get({ id });
  },

  findBySlug(slug: string): Series | undefined {
    return findBySlugStmt.get({ slug });
  },

  findByAuthorId(authorId: string): Series[] {
    return findByAuthorIdStmt.all({ authorId });
  },

  findAll(limit: number, offset: number): Series[] {
    return findAllStmt.all({ limit, offset });
  },

  search(query: string, limit: number): Series[] {
    return searchStmt.all({ query: `%${query}%`, limit });
  },

  create(input: CreateSeriesInput): Series {
    return createStmt.get({
      id: input.id,
      name: input.name,
      originalName: input.originalName ?? null,
      slug: input.slug,
      authorId: input.authorId,
      description: input.description ?? null,
    })!;
  },

  update(id: string, input: Partial<Omit<CreateSeriesInput, 'id'>>): Series {
    return updateStmt.get({
      id,
      name: input.name,
      originalName: input.originalName,
      slug: input.slug,
      authorId: input.authorId,
      description: input.description,
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

  findFeatured(limit: number): (Series & { bookCount: number })[] {
    return findFeaturedStmt.all({ limit });
  },
};
