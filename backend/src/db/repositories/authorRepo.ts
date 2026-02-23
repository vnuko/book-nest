import { db } from '../index.js';
import type { Author, CreateAuthorInput } from '../../types/db.js';

const findByIdStmt = db.prepare<[{ id: string }], Author>(`
  SELECT * FROM authors WHERE id = @id
`);

const findBySlugStmt = db.prepare<[{ slug: string }], Author>(`
  SELECT * FROM authors WHERE slug = @slug
`);

const findByNameStmt = db.prepare<[{ name: string }], Author>(`
  SELECT * FROM authors WHERE name = @name
`);

const findAllStmt = db.prepare<[{ limit: number; offset: number }], Author>(`
  SELECT * FROM authors ORDER BY name LIMIT @limit OFFSET @offset
`);

const searchStmt = db.prepare<[{ query: string; limit: number }], Author>(`
  SELECT * FROM authors WHERE name LIKE @query ORDER BY name LIMIT @limit
`);

const createStmt = db.prepare<
  [
    Omit<CreateAuthorInput, 'bio' | 'dateOfBirth' | 'nationality' | 'openLibraryKey'> & {
      bio: string | null;
      dateOfBirth: string | null;
      nationality: string | null;
      openLibraryKey: string | null;
    },
  ],
  Author
>(`
  INSERT INTO authors (id, name, slug, bio, dateOfBirth, nationality, openLibraryKey)
  VALUES (@id, @name, @slug, @bio, @dateOfBirth, @nationality, @openLibraryKey)
  RETURNING *
`);

const updateStmt = db.prepare<
  [
    {
      id: string;
      name?: string;
      slug?: string;
      bio?: string | null;
      dateOfBirth?: string | null;
      nationality?: string | null;
      openLibraryKey?: string | null;
      updatedAt: string;
    },
  ],
  Author
>(`
  UPDATE authors SET
    name = COALESCE(@name, name),
    slug = COALESCE(@slug, slug),
    bio = COALESCE(@bio, bio),
    dateOfBirth = COALESCE(@dateOfBirth, dateOfBirth),
    nationality = COALESCE(@nationality, nationality),
    openLibraryKey = COALESCE(@openLibraryKey, openLibraryKey),
    updatedAt = @updatedAt
  WHERE id = @id
  RETURNING *
`);

const deleteStmt = db.prepare<[{ id: string }], { changes: number }>(`
  DELETE FROM authors WHERE id = @id
`);

const countStmt = db.prepare<[], { count: number }>(`
  SELECT COUNT(*) as count FROM authors
`);

const findPopularStmt = db.prepare<[{ limit: number }], Author & { bookCount: number }>(`
  SELECT a.*, COUNT(b.id) as bookCount
  FROM authors a
  LEFT JOIN books b ON a.id = b.authorId
  GROUP BY a.id
  ORDER BY bookCount DESC, a.name ASC
  LIMIT @limit
`);

export const authorRepo = {
  findById(id: string): Author | undefined {
    return findByIdStmt.get({ id });
  },

  findBySlug(slug: string): Author | undefined {
    return findBySlugStmt.get({ slug });
  },

  findByName(name: string): Author | undefined {
    return findByNameStmt.get({ name });
  },

  findAll(limit: number, offset: number): Author[] {
    return findAllStmt.all({ limit, offset });
  },

  search(query: string, limit: number): Author[] {
    return searchStmt.all({ query: `%${query}%`, limit });
  },

  create(input: CreateAuthorInput): Author {
    return createStmt.get({
      id: input.id,
      name: input.name,
      slug: input.slug,
      bio: input.bio ?? null,
      dateOfBirth: input.dateOfBirth ?? null,
      nationality: input.nationality ?? null,
      openLibraryKey: input.openLibraryKey ?? null,
    })!;
  },

  update(id: string, input: Partial<Omit<CreateAuthorInput, 'id'>>): Author {
    return updateStmt.get({
      id,
      name: input.name,
      slug: input.slug,
      bio: input.bio,
      dateOfBirth: input.dateOfBirth,
      nationality: input.nationality,
      openLibraryKey: input.openLibraryKey,
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

  findPopular(limit: number): (Author & { bookCount: number })[] {
    return findPopularStmt.all({ limit });
  },
};
