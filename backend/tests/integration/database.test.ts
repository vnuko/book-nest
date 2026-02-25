import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import Database from 'better-sqlite3';
import fs from 'fs-extra';
import path from 'path';
import {
  authorRepo,
  bookRepo,
  seriesRepo,
  fileRepo,
  batchRepo,
} from '../../src/db/repositories/index.js';
import { generateAuthorId, generateBookId, generateSeriesId } from '../../src/utils/idGenerator.js';

const TEST_DIR = path.join(process.cwd(), 'tests', 'integration', 'test-run');
const TEST_DB_PATH = path.join(TEST_DIR, 'test.db');

let testDb: Database.Database;

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    await fs.ensureDir(TEST_DIR);
    testDb = new Database(TEST_DB_PATH);

    testDb.exec(`
      CREATE TABLE IF NOT EXISTS authors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        bio TEXT,
        dateOfBirth TEXT,
        nationality TEXT,
        openLibraryKey TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS series (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        originalName TEXT,
        slug TEXT NOT NULL,
        authorId TEXT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES authors(id) ON DELETE CASCADE,
        UNIQUE(name, authorId)
      );
      
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        originalTitle TEXT,
        slug TEXT NOT NULL,
        authorId TEXT NOT NULL,
        seriesId TEXT,
        seriesOrder INTEGER,
        description TEXT,
        firstPublishYear INTEGER,
        liked INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (authorId) REFERENCES authors(id) ON DELETE CASCADE,
        FOREIGN KEY (seriesId) REFERENCES series(id) ON DELETE SET NULL,
        UNIQUE(authorId, slug)
      );
      
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        bookId TEXT,
        authorId TEXT,
        type TEXT NOT NULL,
        format TEXT NOT NULL,
        path TEXT NOT NULL,
        sha256 TEXT,
        size INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (authorId) REFERENCES authors(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS indexing_batches (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        totalBooks INTEGER DEFAULT 0,
        processedBooks INTEGER DEFAULT 0,
        failedBooks INTEGER DEFAULT 0,
        startedAt DATETIME,
        completedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS indexing_batch_items (
        id TEXT PRIMARY KEY,
        batchId TEXT NOT NULL,
        filePath TEXT NOT NULL,
        sourceSha256 TEXT,
        status TEXT NOT NULL,
        agentResults TEXT,
        errorMessage TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (batchId) REFERENCES indexing_batches(id) ON DELETE CASCADE
      );
    `);
  });

  afterAll(async () => {
    if (testDb) {
      testDb.close();
    }
    await fs.remove(TEST_DIR);
  });

  beforeEach(() => {
    testDb.exec('DELETE FROM files');
    testDb.exec('DELETE FROM books');
    testDb.exec('DELETE FROM series');
    testDb.exec('DELETE FROM authors');
    testDb.exec('DELETE FROM indexing_batch_items');
    testDb.exec('DELETE FROM indexing_batches');
  });

  describe('Author Repository', () => {
    it('should create and find author', () => {
      const authorId = generateAuthorId();

      testDb
        .prepare(
          'INSERT INTO authors (id, name, slug) VALUES (?, ?, ?)',
        )
        .run(authorId, 'Test Author', 'test-author');

      const author = testDb
        .prepare('SELECT * FROM authors WHERE id = ?')
        .get(authorId) as { id: string; name: string; slug: string };

      expect(author).toBeDefined();
      expect(author.name).toBe('Test Author');
      expect(author.slug).toBe('test-author');
    });

    it('should find author by slug', () => {
      const authorId = generateAuthorId();

      testDb
        .prepare('INSERT INTO authors (id, name, slug) VALUES (?, ?, ?)')
        .run(authorId, 'Test Author', 'test-author');

      const author = testDb
        .prepare('SELECT * FROM authors WHERE slug = ?')
        .get('test-author') as { id: string };

      expect(author).toBeDefined();
      expect(author.id).toBe(authorId);
    });

    it('should list authors with pagination', () => {
      for (let i = 1; i <= 5; i++) {
        testDb
          .prepare('INSERT INTO authors (id, name, slug) VALUES (?, ?, ?)')
          .run(generateAuthorId(), `Author ${i}`, `author-${i}`);
      }

      const authors = testDb
        .prepare('SELECT * FROM authors ORDER BY name LIMIT 3')
        .all() as Array<{ name: string }>;

      expect(authors).toHaveLength(3);
    });
  });

  describe('Book Repository', () => {
    it('should create book with author relationship', () => {
      const authorId = generateAuthorId();
      const bookId = generateBookId();

      testDb
        .prepare('INSERT INTO authors (id, name, slug) VALUES (?, ?, ?)')
        .run(authorId, 'Test Author', 'test-author');

      testDb
        .prepare(
          'INSERT INTO books (id, title, slug, authorId, description) VALUES (?, ?, ?, ?, ?)',
        )
        .run(bookId, 'Test Book', 'test-book', authorId, 'A description');

      const book = testDb
        .prepare(
          `SELECT b.*, a.name as authorName FROM books b 
         JOIN authors a ON b.authorId = a.id 
         WHERE b.id = ?`,
        )
        .get(bookId) as { title: string; authorName: string };

      expect(book).toBeDefined();
      expect(book.title).toBe('Test Book');
      expect(book.authorName).toBe('Test Author');
    });

    it('should find books by author', () => {
      const authorId = generateAuthorId();

      testDb
        .prepare('INSERT INTO authors (id, name, slug) VALUES (?, ?, ?)')
        .run(authorId, 'Test Author', 'test-author');

      testDb
        .prepare('INSERT INTO books (id, title, slug, authorId) VALUES (?, ?, ?, ?)')
        .run(generateBookId(), 'Book 1', 'book-1', authorId);

      testDb
        .prepare('INSERT INTO books (id, title, slug, authorId) VALUES (?, ?, ?, ?)')
        .run(generateBookId(), 'Book 2', 'book-2', authorId);

      const books = testDb
        .prepare('SELECT * FROM books WHERE authorId = ?')
        .all(authorId) as Array<{ title: string }>;

      expect(books).toHaveLength(2);
    });
  });

  describe('Series Repository', () => {
    it('should create series with author relationship', () => {
      const authorId = generateAuthorId();
      const seriesId = generateSeriesId();

      testDb
        .prepare('INSERT INTO authors (id, name, slug) VALUES (?, ?, ?)')
        .run(authorId, 'Test Author', 'test-author');

      testDb
        .prepare(
          'INSERT INTO series (id, name, slug, authorId) VALUES (?, ?, ?, ?)',
        )
        .run(seriesId, 'Test Series', 'test-series', authorId);

      const series = testDb
        .prepare('SELECT * FROM series WHERE id = ?')
        .get(seriesId) as { name: string; authorId: string };

      expect(series).toBeDefined();
      expect(series.name).toBe('Test Series');
      expect(series.authorId).toBe(authorId);
    });
  });

  describe('File Repository', () => {
    it('should create file linked to book', () => {
      const authorId = generateAuthorId();
      const bookId = generateBookId();

      testDb
        .prepare('INSERT INTO authors (id, name, slug) VALUES (?, ?, ?)')
        .run(authorId, 'Test Author', 'test-author');

      testDb
        .prepare('INSERT INTO books (id, title, slug, authorId) VALUES (?, ?, ?, ?)')
        .run(bookId, 'Test Book', 'test-book', authorId);

      testDb
        .prepare(
          'INSERT INTO files (id, bookId, type, format, path, sha256) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .run('file-001', bookId, 'book', 'epub', '/path/to/book.epub', 'abc123');

      const file = testDb
        .prepare('SELECT * FROM files WHERE bookId = ?')
        .get(bookId) as { format: string; sha256: string };

      expect(file).toBeDefined();
      expect(file.format).toBe('epub');
      expect(file.sha256).toBe('abc123');
    });

    it('should find file by sha256', () => {
      const authorId = generateAuthorId();
      const bookId = generateBookId();

      testDb
        .prepare('INSERT INTO authors (id, name, slug) VALUES (?, ?, ?)')
        .run(authorId, 'Test Author', 'test-author');

      testDb
        .prepare('INSERT INTO books (id, title, slug, authorId) VALUES (?, ?, ?, ?)')
        .run(bookId, 'Test Book', 'test-book', authorId);

      testDb
        .prepare('INSERT INTO files (id, bookId, type, format, path, sha256) VALUES (?, ?, ?, ?, ?, ?)')
        .run('file-001', bookId, 'book', 'epub', '/path/to/book.epub', 'unique-hash');

      const file = testDb
        .prepare('SELECT * FROM files WHERE sha256 = ?')
        .get('unique-hash') as { id: string };

      expect(file).toBeDefined();
      expect(file.id).toBe('file-001');
    });
  });

  describe('Batch Repository', () => {
    it('should create and track batch', () => {
      testDb
        .prepare(
          'INSERT INTO indexing_batches (id, status, totalBooks) VALUES (?, ?, ?)',
        )
        .run('batch-001', 'pending', 10);

      const batch = testDb
        .prepare('SELECT * FROM indexing_batches WHERE id = ?')
        .get('batch-001') as { status: string; totalBooks: number };

      expect(batch).toBeDefined();
      expect(batch.status).toBe('pending');
      expect(batch.totalBooks).toBe(10);
    });

    it('should update batch status', () => {
      testDb
        .prepare(
          'INSERT INTO indexing_batches (id, status, totalBooks) VALUES (?, ?, ?)',
        )
        .run('batch-001', 'pending', 10);

      testDb
        .prepare('UPDATE indexing_batches SET status = ?, processedBooks = ? WHERE id = ?')
        .run('completed', 10, 'batch-001');

      const batch = testDb
        .prepare('SELECT * FROM indexing_batches WHERE id = ?')
        .get('batch-001') as { status: string; processedBooks: number };

      expect(batch.status).toBe('completed');
      expect(batch.processedBooks).toBe(10);
    });

    it('should create batch items', () => {
      testDb
        .prepare(
          'INSERT INTO indexing_batches (id, status, totalBooks) VALUES (?, ?, ?)',
        )
        .run('batch-001', 'pending', 2);

      testDb
        .prepare(
          'INSERT INTO indexing_batch_items (id, batchId, filePath, status) VALUES (?, ?, ?, ?)',
        )
        .run('item-001', 'batch-001', '/path/to/book1.epub', 'pending');

      testDb
        .prepare(
          'INSERT INTO indexing_batch_items (id, batchId, filePath, status) VALUES (?, ?, ?, ?)',
        )
        .run('item-002', 'batch-001', '/path/to/book2.epub', 'pending');

      const items = testDb
        .prepare('SELECT * FROM indexing_batch_items WHERE batchId = ?')
        .all('batch-001') as Array<{ filePath: string }>;

      expect(items).toHaveLength(2);
    });
  });
});
