# Development Guide

## Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Configure `GROQ_API_KEY`
5. Run: `npm run dev`

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- No comments unless necessary
- Async/await for async operations

## Available Scripts

```bash
npm run dev          # Start development server with watch
npm run build        # Compile TypeScript to dist/
npm start            # Run production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm test             # Run all tests
npm run test:unit    # Run unit tests
npm run test:integration  # Run integration tests
npm run test:coverage     # Run tests with coverage
```

## Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

## Architecture

### Database Layer
- SQLite with better-sqlite3
- Repository pattern for data access
- Schema defined in `src/db/index.ts`

### API Layer
- Express.js
- Controller per resource
- Centralized error handling

### Indexer
- File crawler discovers ebooks
- Batch processor orchestrates indexing
- AI agents process in sequence:
  1. Name Resolver
  2. Image Resolver
  3. Metadata Resolver

### Services
- GroqService: AI API calls
- CalibreService: Format conversion
- ImageService: Image downloading

## Directory Structure

```
src/
├── api/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   └── routes/         # Route definitions
├── config/             # Configuration
├── db/
│   └── repositories/   # Data access layer
├── indexer/
│   ├── agents/         # AI agents
│   ├── batchProcessor.ts
│   ├── crawler.ts
│   └── fileOrganizer.ts
├── services/           # External services
├── types/              # TypeScript types
└── utils/              # Utility functions
```

## Adding a New Endpoint

1. Define types in `src/types/api.ts`
2. Create controller in `src/api/controllers/`
3. Create routes in `src/api/routes/`
4. Add to router in `src/api/routes/index.ts`
5. Add tests

## Debugging

Set `LOG_LEVEL=DEVELOPMENT` for detailed logs.

Check `logs/batch-{id}.log` for indexing details.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3000 | Server port |
| NODE_ENV | No | development | Environment |
| LOG_LEVEL | No | DEVELOPMENT | Logging verbosity |
| SOURCE_PATH | No | ./source | Input directory |
| EBOOKS_PATH | No | ./ebooks | Output directory |
| LOGS_PATH | No | ./logs | Log directory |
| DB_PATH | No | ./data/booknest.db | Database path |
| GROQ_API_KEY | Yes | - | Groq API key |
| GROQ_MODEL | No | llama-3.3-70b-versatile | AI model |
| BATCH_SIZE | No | 25 | Books per batch |
| AGENT_TIMEOUT | No | 60000 | Agent timeout (ms) |
| MAX_RETRIES | No | 5 | Max API retries |
| RETRY_BASE_DELAY | No | 10000 | Retry delay (ms) |
| CALIBRE_PATH | No | /usr/bin/ebook-convert | Calibre path |
