import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import type { EbookFormat } from '../utils/formatDetector.js';

export interface ConversionResult {
  success: boolean;
  outputPath: string | null;
  error: string | null;
  duration: number;
}

export interface ConversionOptions {
  inputPath: string;
  outputFormat: EbookFormat;
  outputPath?: string;
  timeout?: number;
}

const FORMAT_PRIORITY: EbookFormat[] = ['epub', 'mobi', 'azw3', 'txt', 'pdf'];

class CalibreService {
  private calibrePath: string;
  private defaultTimeout: number;

  constructor() {
    this.calibrePath = config.calibre.path;
    this.defaultTimeout = 120000;
  }

  private isCalibreAvailable(): boolean {
    return fs.existsSync(this.calibrePath);
  }

  async convert(options: ConversionOptions): Promise<ConversionResult> {
    const startTime = Date.now();
    const { inputPath, outputFormat, outputPath, timeout = this.defaultTimeout } = options;

    if (!this.isCalibreAvailable()) {
      return {
        success: false,
        outputPath: null,
        error: `Calibre not found at ${this.calibrePath}`,
        duration: 0,
      };
    }

    const inputExt = path.extname(inputPath).toLowerCase().slice(1);

    if (inputExt === outputFormat) {
      return {
        success: true,
        outputPath: inputPath,
        error: null,
        duration: 0,
      };
    }

    const finalOutputPath = outputPath || inputPath.replace(/\.[^.]+$/, `.${outputFormat}`);

    logger.debug('Starting conversion', {
      input: inputPath,
      output: finalOutputPath,
      format: outputFormat,
    });

    try {
      await this.runConversion(inputPath, finalOutputPath, timeout);

      const duration = Date.now() - startTime;
      logger.info('Conversion successful', {
        input: inputPath,
        output: finalOutputPath,
        duration,
      });

      return {
        success: true,
        outputPath: finalOutputPath,
        error: null,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = (error as Error).message;

      logger.warn('Conversion failed', {
        input: inputPath,
        output: finalOutputPath,
        error: errorMessage,
        duration,
      });

      return {
        success: false,
        outputPath: null,
        error: errorMessage,
        duration,
      };
    }
  }

  private runConversion(
    inputPath: string,
    outputPath: string,
    timeout: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [inputPath, outputPath];

      const proc = spawn(this.calibrePath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeoutId = setTimeout(() => {
        proc.kill();
        reject(new Error(`Conversion timed out after ${timeout}ms`));
      }, timeout);

      proc.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });

      proc.on('close', (code) => {
        clearTimeout(timeoutId);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Conversion failed with code ${code}: ${stderr || stdout}`));
        }
      });
    });
  }

  async convertToFormats(
    inputPath: string,
    targetFormats: EbookFormat[],
    outputDir: string,
    baseName: string,
  ): Promise<Map<EbookFormat, ConversionResult>> {
    const results = new Map<EbookFormat, ConversionResult>();

    for (const format of targetFormats) {
      const inputExt = path.extname(inputPath).toLowerCase().slice(1);

      if (inputExt === format) {
        results.set(format, {
          success: true,
          outputPath: inputPath,
          error: null,
          duration: 0,
        });
        continue;
      }

      const outputPath = path.join(outputDir, `${baseName}.${format}`);

      const result = await this.convert({
        inputPath,
        outputFormat: format,
        outputPath,
      });

      results.set(format, result);
    }

    const successful = Array.from(results.values()).filter((r) => r.success).length;
    const failed = results.size - successful;

    logger.info('Batch conversion complete', {
      total: results.size,
      successful,
      failed,
    });

    return results;
  }

  getBestSourceFormat(availableFormats: EbookFormat[]): EbookFormat | null {
    for (const format of FORMAT_PRIORITY) {
      if (availableFormats.includes(format)) {
        return format;
      }
    }

    return availableFormats[0] || null;
  }

  getConversionTargets(
    sourceFormat: EbookFormat,
    existingFormats: EbookFormat[],
  ): EbookFormat[] {
    const allTargets: EbookFormat[] = ['epub', 'mobi', 'txt'];

    return allTargets.filter(
      (format) => format !== sourceFormat && !existingFormats.includes(format),
    );
  }
}

export const calibreService = new CalibreService();
