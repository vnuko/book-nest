import fs from 'fs-extra';
import path from 'path';
import { config } from '../config/index.js';
import type { LogLevel, LogProfile, LogEntry, LoggerOptions } from '../types/logger.js';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const PROFILE_LEVELS: Record<LogProfile, LogLevel[]> = {
  DEVELOPMENT: ['debug', 'info', 'warn', 'error'],
  PRODUCTION: ['warn', 'error'],
};

class Logger {
  private profile: LogProfile;
  private logDir: string;
  private batchId: string | null;
  private appLogFile: string;
  private batchLogFile: string | null = null;
  private minLevel: number;
  private initialized: boolean = false;

  constructor(options?: Partial<LoggerOptions>) {
    this.profile = options?.profile || (config.logging.level as LogProfile);
    this.logDir = options?.logDir || config.paths.logs;
    this.batchId = options?.batchId || null;

    this.appLogFile = path.join(this.logDir, 'app.log');

    const allowedLevels = PROFILE_LEVELS[this.profile];
    this.minLevel = LOG_LEVELS[allowedLevels[0]];

    this.ensureLogDir()
      .then(() => {
        this.initialized = true;
      })
      .catch(() => {});

    if (this.batchId) {
      this.batchLogFile = path.join(this.logDir, `batch-${this.batchId}.log`);
    }
  }

  private async ensureLogDir(): Promise<void> {
    await fs.ensureDir(this.logDir);
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.minLevel;
  }

  private formatEntry(entry: LogEntry): string {
    const contextStr = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error
      ? ` | Error: ${entry.error.name}: ${entry.error.message}${entry.error.stack ? `\nStack: ${entry.error.stack}` : ''}`
      : '';

    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}${errorStr}\n`;
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    const formatted = this.formatEntry(entry);

    const writePromises: Promise<void>[] = [fs.appendFile(this.appLogFile, formatted)];

    if (this.batchLogFile) {
      writePromises.push(fs.appendFile(this.batchLogFile, formatted));
    }

    await Promise.all(writePromises);

    if (this.profile === 'DEVELOPMENT') {
      process.stdout.write(formatted);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.writeLog(entry).catch(() => {});
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }

  withBatch(batchId: string): Logger {
    return new Logger({
      profile: this.profile,
      logDir: this.logDir,
      batchId,
    });
  }

  async rotateLogs(maxSizeMB: number = 10): Promise<void> {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (const logFile of [this.appLogFile, this.batchLogFile]) {
      if (!logFile) continue;

      try {
        const stats = await fs.stat(logFile);
        if (stats.size > maxSizeBytes) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
          await fs.move(logFile, rotatedFile);
          this.info(`Log rotated: ${logFile} -> ${rotatedFile}`);
        }
      } catch {
        // File doesn't exist, ignore
      }
    }
  }
}

export const logger = new Logger();
export { Logger };

export function createBatchLogger(batchId: string): Logger {
  return logger.withBatch(batchId);
}
