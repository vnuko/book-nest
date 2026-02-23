import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';
import { hashFile, detectFormat, type EbookFormat } from '../utils/index.js';
import { config } from '../config/index.js';

export interface DiscoveredFile {
  path: string;
  format: EbookFormat;
  size: number;
}

export interface HashedFile extends DiscoveredFile {
  sha256: string;
}

export interface CrawlResult {
  files: HashedFile[];
  totalSize: number;
  errors: Array<{ path: string; error: string }>;
}

class FileCrawler {
  private sourcePath: string;

  constructor(sourcePath?: string) {
    this.sourcePath = sourcePath || config.paths.source;
  }

  async discoverFiles(): Promise<DiscoveredFile[]> {
    logger.info('Starting file discovery', { sourcePath: this.sourcePath });

    const pattern = path.join(this.sourcePath, '**', '*.*').replace(/\\/g, '/');
    const files = await glob(pattern, { nodir: true });

    const discovered: DiscoveredFile[] = [];

    for (const filePath of files) {
      const format = detectFormat(filePath);

      if (!format) {
        continue;
      }

      try {
        const stats = await fs.stat(filePath);
        discovered.push({
          path: filePath,
          format,
          size: stats.size,
        });
      } catch (error) {
        logger.warn('Failed to stat file', { filePath, error: (error as Error).message });
      }
    }

    logger.info('File discovery complete', { count: discovered.length });
    return discovered;
  }

  async hashFiles(files: DiscoveredFile[]): Promise<HashedFile[]> {
    logger.info('Hashing files', { count: files.length });

    const hashed: HashedFile[] = [];

    for (const file of files) {
      try {
        const sha256 = await hashFile(file.path);
        hashed.push({ ...file, sha256 });
        logger.debug('File hashed', { path: file.path, sha256: sha256.substring(0, 8) });
      } catch (error) {
        logger.error('Failed to hash file', error as Error, { path: file.path });
      }
    }

    logger.info('Hashing complete', { count: hashed.length });
    return hashed;
  }

  async crawl(): Promise<CrawlResult> {
    const files = await this.discoverFiles();
    const hashedFiles = await this.hashFiles(files);

    const totalSize = hashedFiles.reduce((sum, f) => sum + f.size, 0);
    const errors: Array<{ path: string; error: string }> = [];

    return {
      files: hashedFiles,
      totalSize,
      errors,
    };
  }
}

export const fileCrawler = new FileCrawler();

export function createCrawler(sourcePath: string): FileCrawler {
  return new FileCrawler(sourcePath);
}
