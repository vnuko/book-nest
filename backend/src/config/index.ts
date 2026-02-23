import dotenv from 'dotenv';
dotenv.config();

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
  },
  logging: {
    level: process.env.LOG_LEVEL || 'DEVELOPMENT',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    batchSize: parseInt(process.env.BATCH_SIZE || '25', 10),
    timeout: parseInt(process.env.AGENT_TIMEOUT || '60000', 10),
  },
  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '5', 10),
    baseDelay: parseInt(process.env.RETRY_BASE_DELAY || '10000', 10),
  },
  calibre: {
    path: process.env.CALIBRE_PATH || '/usr/bin/ebook-convert',
  },
};

export function validateConfig(): void {
  if (!config.groq.apiKey || config.groq.apiKey === 'your-groq-api-key') {
    throw new Error('GROQ_API_KEY is required in environment variables');
  }
}
