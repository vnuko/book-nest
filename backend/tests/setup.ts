import fs from 'fs-extra';
import path from 'path';

const TEST_DATA_DIR = path.join(process.cwd(), 'tests', 'test-data');
const TEST_DB_PATH = path.join(TEST_DATA_DIR, 'test.db');

export async function setupTestData(): Promise<void> {
  await fs.ensureDir(TEST_DATA_DIR);
}

export async function cleanupTestData(): Promise<void> {
  await fs.remove(TEST_DATA_DIR);
}

export function getTestDbPath(): string {
  return TEST_DB_PATH;
}

export function getTestDataDir(): string {
  return TEST_DATA_DIR;
}
