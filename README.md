# Book Nest

An AI-powered ebook management system that organizes scattered ebook collections into a structured library.

## Features

- **AI-Powered Indexing**: Uses Groq AI (LLaMA) to resolve book names, fetch images, and gather metadata
- **Multi-Format Support**: Handles epub, mobi, txt, pdf with Calibre conversion
- **RESTful API**: Full CRUD operations for books, authors, series
- **Batch Processing**: Processes books in configurable batches with rollback on failure
- **Resume Capability**: Can continue indexing from where it left off

## Quick Start

### Prerequisites

- Node.js 20+
- Calibre (for ebook conversion)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required configuration:
- `GROQ_API_KEY`: Your Groq API key

### Running

```bash
# Development
npm run de

# Production
npm run build
npm start
```

### Testing

```bash
npm test
npm run test:coverage
```

## API Endpoints

### Books
- `GET /api/books` - List all books (paginated)
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/search?q=...` - Search books
- `GET /api/books/author/:authorId` - Books by author

### Authors
- `GET /api/authors` - List all authors
- `GET /api/authors/:id` - Get author by ID
- `GET /api/authors/:id/books` - Author's books

### Series
- `GET /api/series` - List all series
- `GET /api/series/:id` - Get series by ID
- `GET /api/series/:id/books` - Books in series

### Files
- `GET /api/files/books/:bookId/download/:format` - Download book
- `GET /api/files/images/authors/:authorId` - Get author image
- `GET /api/files/images/books/:bookId` - Get book cover

### Indexing
- `POST /api/indexing/start` - Start indexing
- `GET /api/indexing/status` - Get status
- `GET /api/indexing/history` - List past batches

## Project Structure

```
book_nest/
├── src/
│   ├── indexer/       # File crawling and agents
│   ├── api/           # Express routes and controllers
│   ├── db/            # Database schema and repositories
│   ├── services/      # Groq, Calibre, Image services
│   └── utils/         # Utilities
├── source/            # Input: unorganized ebooks
├── ebooks/            # Output: organized library
├── logs/              # Application and batch logs
└── data/              # SQLite database
```

## Indexing Workflow

1. Place ebooks in `source/` directory
2. Call `POST /api/indexing/start`
3. System crawls files, calculates hashes
4. AI agents process batches:
   - Name Resolver: Extract author, title, series
   - Image Resolver: Find cover images
   - Metadata Resolver: Get descriptions, ISBN, etc.
5. Files are organized into `ebooks/{author}/{book}/`
6. Optional format conversion via Calibre

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| LOG_LEVEL | Logging level | DEVELOPMENT |
| BATCH_SIZE | Books per batch | 25 |
| GROQ_API_KEY | Groq API key | (required) |
| GROQ_MODEL | AI model | llama-3.3-70b-versatile |
| CALIBRE_PATH | Path to ebook-convert | /usr/bin/ebook-convert |

## License

MIT
