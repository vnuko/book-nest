import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { initDb } from './db/index.js';
import { config } from './config/index.js';
import { swaggerSpec } from './config/swagger.js';
import { logger } from './utils/logger.js';
import { displaySplash } from './utils/splash.js';
import apiRoutes from './api/routes/index.js';
import { notFoundHandler, errorHandler } from './api/middleware/errorHandler.js';

dotenv.config();

const app = express();

async function initialize(): Promise<void> {
  logger.info('Initializing Book Nest...');

  initDb();
  logger.info('Database initialized');

  logger.info('Book Nest initialized successfully');
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.debug('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Book Nest API',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api-docs',
    openapiSpec: '/api-docs/swagger.json',
    endpoints: {
      overview: '/api/overview',
      books: '/api/books',
      authors: '/api/authors',
      series: '/api/series',
      files: '/api/files',
      indexing: '/api/indexing',
      search: '/api/search',
    },
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs/swagger.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer(): Promise<void> {
  await initialize();

  const PORT = config.server.port;

  app.listen(PORT, () => {
    displaySplash();
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});

export default app;
