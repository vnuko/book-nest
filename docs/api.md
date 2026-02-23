# API Documentation

## Authentication

Currently no authentication required. For production, add API keys or JWT.

## Response Format

All responses are JSON:

### Success
```json
{
  "data": { ... },
  "pagination": { ... }
}
```

### Error
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "statusCode": 404
  }
}
```

## Pagination

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Endpoints

### Books

#### GET /api/books
List all books with pagination.

#### GET /api/books/:id
Get single book with author, series, and files.

#### GET /api/books/search?q=query
Search books by title or author name.

#### GET /api/books/author/:authorId
Get all books by an author.

#### GET /api/books/series/:seriesId
Get all books in a series.

#### GET /api/books/:id/files
Get all files for a book.

### Authors

#### GET /api/authors
List all authors.

#### GET /api/authors/:id
Get author details with book count.

#### GET /api/authors/:id/books
Get author's books.

#### GET /api/authors/:id/series
Get author's series.

#### GET /api/authors/search?q=query
Search authors by name.

### Series

#### GET /api/series
List all series.

#### GET /api/series/:id
Get series details.

#### GET /api/series/:id/books
Get books in series.

#### GET /api/series/search?q=query
Search series by name.

### Files

#### GET /api/files/books/:bookId/download/:format
Download book file. Format: epub, mobi, txt, pdf.

#### GET /api/files/images/authors/:authorId
Get author photo.

#### GET /api/files/images/books/:bookId
Get book cover image.

### Indexing

#### POST /api/indexing/start
Start indexing process.

Request:
```json
{
  "sourcePath": "./source",
  "resume": false
}
```

Response:
```json
{
  "data": {
    "batchId": "batch-2026-02-13-abc123",
    "status": "completed",
    "totalBooks": 150,
    "processedBooks": 150,
    "failedBooks": 0,
    "duration": 125000
  }
}
```

#### GET /api/indexing/status
Get current indexing status.

#### GET /api/indexing/history
List past indexing batches.

#### DELETE /api/indexing/batch/:id
Cancel and rollback a batch.

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| NOT_FOUND | 404 | Resource not found |
| BOOK_NOT_FOUND | 404 | Book not found |
| AUTHOR_NOT_FOUND | 404 | Author not found |
| SERIES_NOT_FOUND | 404 | Series not found |
| FILE_NOT_FOUND | 404 | File not found |
| IMAGE_NOT_FOUND | 404 | Image not found |
| INVALID_QUERY | 400 | Invalid search query |
| INDEXING_IN_PROGRESS | 409 | Indexing already running |
| BATCH_NOT_CANCELLABLE | 400 | Batch cannot be cancelled |
| INTERNAL_ERROR | 500 | Unexpected server error |
