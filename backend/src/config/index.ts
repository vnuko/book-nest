import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

dotenv.config({ path: path.join(projectRoot, '.env') });

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  paths: {
    source: process.env.SOURCE_PATH || './source',
    ebooks: process.env.EBOOKS_PATH || './ebooks',
    logs: process.env.LOGS_PATH || './logs',
    db: process.env.DB_PATH || './data/booknest.db',
    processed: process.env.PROCESSED_PATH || './source/processed',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'DEVELOPMENT',
  },
  ai: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    batchSize: parseInt(process.env.BATCH_SIZE || '25', 10),
    timeout: parseInt(process.env.AGENT_TIMEOUT || '60000', 10),
  },
  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '5', 10),
    baseDelay: parseInt(process.env.RETRY_BASE_DELAY || '10000', 10),
  },
  calibre: {
    path: process.env.CALIBRE_PATH || '/usr/bin/ebook-convert',
    fallbackPaths: [
      '/usr/bin/ebook-convert',
      '/Applications/calibre.app/Contents/MacOS/ebook-convert',
      'C:\\Program Files\\Calibre\\ebook-convert.exe',
      'C:\\Program Files (x86)\\Calibre\\ebook-convert.exe',
    ],
  },
};

export function validateConfig(): void {
  if (!config.ai.apiKey || config.ai.apiKey === 'your-gemini-api-key') {
    throw new Error('GEMINI_API_KEY is required in environment variables');
  }
}
