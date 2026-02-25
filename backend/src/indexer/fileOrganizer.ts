import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { buildBookPath, buildAuthorDir, buildBookDir, type EbookFormat } from '../utils/index.js';
import { calibreService } from '../services/calibreService.js';

export interface MoveProcessedResult {
  originalPath: string;
  newPath: string;
  success: boolean;
  error?: string;
}

export interface OrganizeFileResult {
  originalPath: string;
  newPath: string;
  format: EbookFormat;
  sha256: string;
  success: boolean;
  error?: string;
}

export interface OrganizeBookResult {
  authorSlug: string;
  bookSlug: string;
  files: OrganizeFileResult[];
  conversions: Map<EbookFormat, { success: boolean; path: string | null; error?: string }>;
}

class FileOrganizer {
  private ebooksDir: string;

  constructor(ebooksDir?: string) {
    this.ebooksDir = ebooksDir || config.paths.ebooks;
  }

  async ensureDirectoryStructure(authorSlug: string, bookSlug: string): Promise<void> {
    const authorDir = buildAuthorDir(this.ebooksDir, authorSlug);
    const bookDir = buildBookDir(this.ebooksDir, authorSlug, bookSlug);

    await fs.ensureDir(authorDir);
    await fs.ensureDir(bookDir);
  }

  async copyFile(
    sourcePath: string,
    authorSlug: string,
    bookSlug: string,
    sha256: string,
    format: EbookFormat,
  ): Promise<OrganizeFileResult> {
    const targetPath = buildBookPath(this.ebooksDir, authorSlug, bookSlug, sha256, format);

    try {
      await this.ensureDirectoryStructure(authorSlug, bookSlug);
      await fs.copy(sourcePath, targetPath, { overwrite: false });

      logger.debug('File copied', {
        source: sourcePath,
        target: targetPath,
      });

      return {
        originalPath: sourcePath,
        newPath: targetPath,
        format,
        sha256,
        success: true,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error('Failed to copy file', error as Error, {
        source: sourcePath,
        target: targetPath,
      });

      return {
        originalPath: sourcePath,
        newPath: targetPath,
        format,
        sha256,
        success: false,
        error: errorMessage,
      };
    }
  }

  async copyFiles(
    files: Array<{
      path: string;
      format: EbookFormat;
      sha256: string;
    }>,
    authorSlug: string,
    bookSlug: string,
  ): Promise<OrganizeFileResult[]> {
    const results: OrganizeFileResult[] = [];

    for (const file of files) {
      const result = await this.copyFile(
        file.path,
        authorSlug,
        bookSlug,
        file.sha256,
        file.format,
      );
      results.push(result);
    }

    return results;
  }

  async convertBook(
    authorSlug: string,
    bookSlug: string,
    sha256: string,
    existingFormats: EbookFormat[],
  ): Promise<Map<EbookFormat, { success: boolean; path: string | null; error?: string }>> {
    const results = new Map<EbookFormat, { success: boolean; path: string | null; error?: string }>();

    const sourceFormat = calibreService.getBestSourceFormat(existingFormats);

    if (!sourceFormat) {
      logger.warn('No valid source format for conversion', {
        authorSlug,
        bookSlug,
        formats: existingFormats,
      });
      return results;
    }

    const sourcePath = buildBookPath(this.ebooksDir, authorSlug, bookSlug, sha256, sourceFormat);
    const outputDir = buildBookDir(this.ebooksDir, authorSlug, bookSlug);
    const targetFormats = calibreService.getConversionTargets(sourceFormat, existingFormats);

    for (const targetFormat of targetFormats) {
      const result = await calibreService.convert({
        inputPath: sourcePath,
        outputFormat: targetFormat,
        outputPath: path.join(outputDir, `${sha256}.${targetFormat}`),
      });

      results.set(targetFormat, {
        success: result.success,
        path: result.outputPath,
        error: result.error || undefined,
      });

      if (result.success) {
        logger.info('Format converted', {
          authorSlug,
          bookSlug,
          format: targetFormat,
        });
      }
    }

    return results;
  }

  async organizeBook(
    files: Array<{
      path: string;
      format: EbookFormat;
      sha256: string;
    }>,
    authorSlug: string,
    bookSlug: string,
    shouldConvert: boolean = true,
  ): Promise<OrganizeBookResult> {
    await this.ensureDirectoryStructure(authorSlug, bookSlug);

    const copyResults = await this.copyFiles(files, authorSlug, bookSlug);
    const successfulFormats = copyResults.filter((r) => r.success).map((r) => r.format);

    let conversions = new Map<EbookFormat, { success: boolean; path: string | null; error?: string }>();

    if (shouldConvert && successfulFormats.length > 0) {
      conversions = await this.convertBook(
        authorSlug,
        bookSlug,
        files[0].sha256,
        successfulFormats,
      );
    }

    return {
      authorSlug,
      bookSlug,
      files: copyResults,
      conversions,
    };
  }

  async removeBook(authorSlug: string, bookSlug: string): Promise<boolean> {
    const bookDir = buildBookDir(this.ebooksDir, authorSlug, bookSlug);

    try {
      await fs.remove(bookDir);
      logger.info('Book directory removed', { bookDir });
      return true;
    } catch (error) {
      logger.error('Failed to remove book directory', error as Error, { bookDir });
      return false;
    }
  }

  async removeAuthor(authorSlug: string): Promise<boolean> {
    const authorDir = buildAuthorDir(this.ebooksDir, authorSlug);

    try {
      await fs.remove(authorDir);
      logger.info('Author directory removed', { authorDir });
      return true;
    } catch (error) {
      logger.error('Failed to remove author directory', error as Error, { authorDir });
      return false;
    }
  }

  async moveProcessedFile(
    sourceFilePath: string,
    sourceBaseDir: string,
    processedDir: string
  ): Promise<MoveProcessedResult> {
    try {
      const normalizedSource = path.resolve(sourceFilePath);
      const normalizedBase = path.resolve(sourceBaseDir);
      const normalizedProcessed = path.resolve(processedDir);

      const relativePath = path.relative(normalizedBase, normalizedSource);

      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        return {
          originalPath: sourceFilePath,
          newPath: '',
          success: false,
          error: 'File is outside source directory',
        };
      }

      const targetPath = path.join(normalizedProcessed, relativePath);
      await fs.ensureDir(path.dirname(targetPath));
      await fs.move(normalizedSource, targetPath, { overwrite: false });

      logger.info('File moved to processed', {
        source: sourceFilePath,
        target: targetPath,
      });

      return {
        originalPath: sourceFilePath,
        newPath: targetPath,
        success: true,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      logger.error('Failed to move file to processed', error as Error, {
        source: sourceFilePath,
      });

      return {
        originalPath: sourceFilePath,
        newPath: '',
        success: false,
        error: errorMessage,
      };
    }
  }

  async moveProcessedFiles(
    filePaths: string[],
    sourceBaseDir: string,
    processedDir: string
  ): Promise<MoveProcessedResult[]> {
    const results: MoveProcessedResult[] = [];

    for (const filePath of filePaths) {
      const result = await this.moveProcessedFile(filePath, sourceBaseDir, processedDir);
      results.push(result);
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    logger.info('Batch file move completed', {
      total: filePaths.length,
      successful,
      failed,
    });

    return results;
  }

  async cleanEmptyFolders(
    authorSlugs: string[],
    sourceBaseDir: string
  ): Promise<{ cleaned: string[]; failed: string[] }> {
    const cleaned: string[] = [];
    const failed: string[] = [];

    for (const slug of authorSlugs) {
      const authorDir = path.join(sourceBaseDir, slug);

      try {
        const exists = await fs.pathExists(authorDir);
        if (!exists) {
          continue;
        }

        const entries = await fs.readdir(authorDir);
        
        if (entries.length === 0) {
          await fs.rmdir(authorDir);
          cleaned.push(slug);
          logger.debug('Removed empty author folder', { slug, path: authorDir });
        }
      } catch (error) {
        failed.push(slug);
        logger.warn('Failed to clean author folder', { slug, error: (error as Error).message });
      }
    }

    if (cleaned.length > 0 || failed.length > 0) {
      logger.info('Empty folder cleanup completed', {
        total: authorSlugs.length,
        cleaned: cleaned.length,
        failed: failed.length,
      });
    }

    return { cleaned, failed };
  }
}

export const fileOrganizer = new FileOrganizer();

export function createFileOrganizer(ebooksDir: string): FileOrganizer {
  return new FileOrganizer(ebooksDir);
}
