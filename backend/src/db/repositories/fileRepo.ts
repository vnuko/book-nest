import { db } from '../index.js';
import type { FileRecord, CreateFileInput } from '../../types/db.js';

const findByIdStmt = db.prepare<[{ id: string }], FileRecord>(`
  SELECT * FROM files WHERE id = @id
`);

const findByBookIdStmt = db.prepare<[{ bookId: string }], FileRecord>(`
  SELECT * FROM files WHERE bookId = @bookId
`);

const findBySha256Stmt = db.prepare<[{ sha256: string }], FileRecord>(`
  SELECT * FROM files WHERE sha256 = @sha256
`);

const findByBookIdAndFormatStmt = db.prepare<[{ bookId: string; format: string }], FileRecord>(`
  SELECT * FROM files WHERE bookId = @bookId AND format = @format
`);

const createStmt = db.prepare<
  [
    Omit<CreateFileInput, 'bookId' | 'sha256' | 'size'> & {
      bookId: string | null;
      sha256: string | null;
      size: number | null;
    },
  ],
  FileRecord
>(`
  INSERT INTO files (id, bookId, type, format, path, sha256, size)
  VALUES (@id, @bookId, @type, @format, @path, @sha256, @size)
  RETURNING *
`);

const deleteStmt = db.prepare<[{ id: string }], { changes: number }>(`
  DELETE FROM files WHERE id = @id
`);

const deleteByBookIdStmt = db.prepare<[{ bookId: string }], { changes: number }>(`
  DELETE FROM files WHERE bookId = @bookId
`);

export const fileRepo = {
  findById(id: string): FileRecord | undefined {
    return findByIdStmt.get({ id });
  },

  findByBookId(bookId: string): FileRecord[] {
    return findByBookIdStmt.all({ bookId });
  },

  findBySha256(sha256: string): FileRecord | undefined {
    return findBySha256Stmt.get({ sha256 });
  },

  findByBookIdAndFormat(bookId: string, format: string): FileRecord | undefined {
    return findByBookIdAndFormatStmt.get({ bookId, format });
  },

  create(input: CreateFileInput): FileRecord {
    return createStmt.get({
      id: input.id,
      bookId: input.bookId ?? null,
      type: input.type,
      format: input.format,
      path: input.path,
      sha256: input.sha256 ?? null,
      size: input.size ?? null,
    })!;
  },

  delete(id: string): boolean {
    const result = deleteStmt.run({ id });
    return result.changes > 0;
  },

  deleteByBookId(bookId: string): boolean {
    const result = deleteByBookIdStmt.run({ bookId });
    return result.changes > 0;
  },
};
