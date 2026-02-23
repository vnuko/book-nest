import fs from 'fs-extra';
import path from 'path';

const TEST_DIR = path.join(process.cwd(), 'tests', 'integration', 'test-run');
const TEST_DB_PATH = path.join(TEST_DIR, 'test.db');

export async function setupTestDb(): Promise<void> {
  await fs.ensureDir(TEST_DIR);

  process.env.DB_PATH = TEST_DB_PATH;
  process.env.SOURCE_PATH = path.join(TEST_DIR, 'source');
  process.env.EBOOKS_PATH = path.join(TEST_DIR, 'ebooks');
  process.env.LOGS_PATH = path.join(TEST_DIR, 'logs');
}

export async function cleanupTestDb(): Promise<void> {
  await fs.remove(TEST_DIR);
}

export function getTestDir(): string {
  return TEST_DIR;
}

export function getTestDbPath(): string {
  return TEST_DB_PATH;
}
