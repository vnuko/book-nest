import Database from 'better-sqlite3';
import type DatabaseType from 'better-sqlite3';
import { config } from '../config/index.js';
import { existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

const dbPath = resolve(config.paths.db);
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

export const db: DatabaseType.Database = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb(): void {
  db.exec(`
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
    CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
    CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

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
    CREATE INDEX IF NOT EXISTS idx_series_author ON series(authorId);
    CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      originalTitle TEXT,
      slug TEXT NOT NULL,
      authorId TEXT NOT NULL,
      seriesId TEXT,
      seriesOrder INTEGER,
      description TEXT,
      isbn TEXT,
      firstPublishYear INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (authorId) REFERENCES authors(id) ON DELETE CASCADE,
      FOREIGN KEY (seriesId) REFERENCES series(id) ON DELETE SET NULL,
      UNIQUE(authorId, slug)
    );
    CREATE INDEX IF NOT EXISTS idx_books_author ON books(authorId);
    CREATE INDEX IF NOT EXISTS idx_books_series ON books(seriesId);
    CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      bookId TEXT,
      type TEXT NOT NULL CHECK(type IN ('book')),
      format TEXT NOT NULL,
      path TEXT NOT NULL,
      sha256 TEXT,
      size INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_files_book ON files(bookId);
    CREATE INDEX IF NOT EXISTS idx_files_sha256 ON files(sha256);

    CREATE TABLE IF NOT EXISTS indexing_batches (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'rolled_back')),
      totalBooks INTEGER DEFAULT 0,
      processedBooks INTEGER DEFAULT 0,
      failedBooks INTEGER DEFAULT 0,
      startedAt DATETIME,
      completedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_batches_status ON indexing_batches(status);

    CREATE TABLE IF NOT EXISTS indexing_batch_items (
      id TEXT PRIMARY KEY,
      batchId TEXT NOT NULL,
      filePath TEXT NOT NULL,
      sourceSha256 TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending', 'name_resolved', 'persisted', 'images_fetched', 'metadata_fetched', 'completed', 'failed')),
      agentResults TEXT,
      errorMessage TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (batchId) REFERENCES indexing_batches(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_batch_items_batch ON indexing_batch_items(batchId);
    CREATE INDEX IF NOT EXISTS idx_batch_items_status ON indexing_batch_items(status);
  `);
}

initDb();
