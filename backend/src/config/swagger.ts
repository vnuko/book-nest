import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Nest API',
      version: '1.0.0',
      description: 'Ebook management system with AI-powered indexing',
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {},
      schemas: {
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        Author: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Brandon Sanderson' },
            slug: { type: 'string', example: 'brandon-sanderson' },
            bio: { type: 'string', nullable: true },
            nationality: { type: 'string', nullable: true },
            dateOfBirth: { type: 'string', format: 'date', nullable: true },
            bookCount: { type: 'integer', example: 45 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Series: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'The Stormlight Archive' },
            originalName: { type: 'string', nullable: true },
            slug: { type: 'string', example: 'the-stormlight-archive' },
            description: { type: 'string', nullable: true },
            author: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                slug: { type: 'string' },
              },
            },
            bookCount: { type: 'integer', example: 4 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BookFile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            format: { type: 'string', example: 'EPUB' },
            size: { type: 'integer', nullable: true },
          },
        },
        Book: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'The Way of Kings' },
            originalTitle: { type: 'string', nullable: true },
            slug: { type: 'string', example: 'the-way-of-kings' },
            description: { type: 'string', nullable: true },
            isbn: { type: 'string', nullable: true },
            firstPublishYear: { type: 'integer', nullable: true },
            author: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                slug: { type: 'string' },
              },
            },
            series: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                slug: { type: 'string' },
              },
            },
            seriesOrder: { type: 'integer', nullable: true },
            files: {
              type: 'array',
              items: { $ref: '#/components/schemas/BookFile' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BookListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Book' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        AuthorListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Author' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        SeriesListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Series' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        SearchResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                books: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Book' },
                },
                authors: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Author' },
                },
                series: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Series' },
                },
              },
            },
          },
        },
        Overview: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                totalBooks: { type: 'integer' },
                totalAuthors: { type: 'integer' },
                totalSeries: { type: 'integer' },
                totalFiles: { type: 'integer' },
                recentBooks: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Book' },
                },
                recentAuthors: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Author' },
                },
              },
            },
          },
        },
        IndexingStatus: {
          type: 'object',
          properties: {
            isRunning: { type: 'boolean' },
            currentBatch: { type: 'string', nullable: true },
            progress: { type: 'number', nullable: true },
            filesProcessed: { type: 'integer' },
            filesTotal: { type: 'integer', nullable: true },
          },
        },
        IndexingHistory: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] },
                  filesProcessed: { type: 'integer' },
                  filesTotal: { type: 'integer' },
                  createdAt: { type: 'string', format: 'date-time' },
                  completedAt: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                statusCode: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/api/routes/*.ts', './src/docs/*.yaml'],
};

export const swaggerSpec = swaggerJsdoc(options);
