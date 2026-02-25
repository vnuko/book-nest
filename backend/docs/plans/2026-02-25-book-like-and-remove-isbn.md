# Book Like Feature & ISBN Removal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a boolean `liked` field to books with a PUT endpoint to toggle it, and remove the `isbn` field from the entire codebase.

**Architecture:** Add `liked` boolean column to books table with default false. Create a PUT endpoint `/api/books/:id/like` to toggle the liked status. Remove ISBN from all layers: DB schema, types, repositories, controllers, agents, and tests.

**Tech Stack:** TypeScript, Express, better-sqlite3, Jest

---

## Part 1: Add Book Like Feature

### Task 1: Update Database Schema

**Files:**
- Modify: `backend/src/db/index.ts:49-65`

**Step 1: Add liked column to books table**

In `initDb()` function, add `liked` column after `firstPublishYear`:

```sql
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  originalTitle TEXT,
  slug TEXT NOT NULL,
  authorId TEXT NOT NULL,
  seriesId TEXT,
  seriesOrder INTEGER,
  description TEXT,
  isbn TEXT,
  firstPublishYear INTEGER,
  liked INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES authors(id) ON DELETE CASCADE,
  FOREIGN KEY (seriesId) REFERENCES series(id) ON DELETE SET NULL,
  UNIQUE(authorId, slug)
);
```

**Step 2: Verify schema compiles**

Run: `cd backend && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add backend/src/db/index.ts
git commit -m "feat(db): add liked column to books table"
```

---

### Task 2: Update Types

**Files:**
- Modify: `backend/src/types/db.ts:35-48`
- Modify: `backend/src/types/db.ts:102-113`
- Modify: `backend/src/types/api.ts:21-47`

**Step 1: Add liked to Book interface**

In `backend/src/types/db.ts`, update Book interface:

```typescript
export interface Book {
  id: string;
  title: string;
  originalTitle: string | null;
  slug: string;
  authorId: string;
  seriesId: string | null;
  seriesOrder: number | null;
  description: string | null;
  isbn: string | null;
  firstPublishYear: number | null;
  liked: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Step 2: Add liked to CreateBookInput**

In `backend/src/types/db.ts`, update CreateBookInput:

```typescript
export interface CreateBookInput {
  id: string;
  title: string;
  originalTitle?: string | null;
  slug: string;
  authorId: string;
  seriesId?: string | null;
  seriesOrder?: number | null;
  description?: string | null;
  isbn?: string | null;
  firstPublishYear?: number | null;
  liked?: boolean;
}
```

**Step 3: Add liked to BookResponse**

In `backend/src/types/api.ts`, update BookResponse:

```typescript
export interface BookResponse {
  id: string;
  title: string;
  originalTitle: string | null;
  slug: string;
  description: string | null;
  isbn: string | null;
  firstPublishYear: number | null;
  liked: boolean;
  author: {
    id: string;
    name: string;
    slug: string;
  };
  series: {
    id: string;
    name: string;
    slug: string;
  } | null;
  seriesOrder: number | null;
  files: Array<{
    id: string;
    format: string;
    size: number | null;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

**Step 4: Verify types compile**

Run: `cd backend && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add backend/src/types/db.ts backend/src/types/api.ts
git commit -m "feat(types): add liked field to Book types"
```

---

### Task 3: Update Book Repository

**Files:**
- Modify: `backend/src/db/repositories/bookRepo.ts:32-51`
- Modify: `backend/src/db/repositories/bookRepo.ts:53-84`
- Modify: `backend/src/db/repositories/bookRepo.ts:123-136`
- Modify: `backend/src/db/repositories/bookRepo.ts:138-152`

**Step 1: Update createStmt to include liked**

```typescript
const createStmt = db.prepare<
  [
    Omit<
      CreateBookInput,
      'originalTitle' | 'seriesId' | 'seriesOrder' | 'description' | 'isbn' | 'firstPublishYear' | 'liked'
    > & {
      originalTitle: string | null;
      seriesId: string | null;
      seriesOrder: number | null;
      description: string | null;
      isbn: string | null;
      firstPublishYear: number | null;
      liked: number;
    },
  ],
  Book
>(`
  INSERT INTO books (id, title, originalTitle, slug, authorId, seriesId, seriesOrder, description, isbn, firstPublishYear, liked)
  VALUES (@id, @title, @originalTitle, @slug, @authorId, @seriesId, @seriesOrder, @description, @isbn, @firstPublishYear, @liked)
  RETURNING *
`);
```

**Step 2: Update updateStmt to include liked**

```typescript
const updateStmt = db.prepare<
  [
    {
      id: string;
      title?: string;
      originalTitle?: string | null;
      slug?: string;
      authorId?: string;
      seriesId?: string | null;
      seriesOrder?: number | null;
      description?: string | null;
      isbn?: string | null;
      firstPublishYear?: number | null;
      liked?: number;
      updatedAt: string;
    },
  ],
  Book
>(`
  UPDATE books SET
    title = COALESCE(@title, title),
    originalTitle = COALESCE(@originalTitle, originalTitle),
    slug = COALESCE(@slug, slug),
    authorId = COALESCE(@authorId, authorId),
    seriesId = COALESCE(@seriesId, seriesId),
    seriesOrder = COALESCE(@seriesOrder, seriesOrder),
    description = COALESCE(@description, description),
    isbn = COALESCE(@isbn, isbn),
    firstPublishYear = COALESCE(@firstPublishYear, firstPublishYear),
    liked = COALESCE(@liked, liked),
    updatedAt = @updatedAt
  WHERE id = @id
  RETURNING *
`);
```

**Step 3: Update create method to handle liked**

```typescript
create(input: CreateBookInput): Book {
  return createStmt.get({
    id: input.id,
    title: input.title,
    originalTitle: input.originalTitle ?? null,
    slug: input.slug,
    authorId: input.authorId,
    seriesId: input.seriesId ?? null,
    seriesOrder: input.seriesOrder ?? null,
    description: input.description ?? null,
    isbn: input.isbn ?? null,
    firstPublishYear: input.firstPublishYear ?? null,
    liked: input.liked ? 1 : 0,
  })!;
},
```

**Step 4: Update update method to handle liked**

```typescript
update(id: string, input: Partial<Omit<CreateBookInput, 'id'>>): Book {
  return updateStmt.get({
    id,
    title: input.title,
    originalTitle: input.originalTitle,
    slug: input.slug,
    authorId: input.authorId,
    seriesId: input.seriesId,
    seriesOrder: input.seriesOrder,
    description: input.description,
    isbn: input.isbn,
    firstPublishYear: input.firstPublishYear,
    liked: input.liked !== undefined ? (input.liked ? 1 : 0) : undefined,
    updatedAt: new Date().toISOString(),
  })!;
},
```

**Step 5: Add toggleLike method**

Add new prepared statement and method after the existing ones:

```typescript
const toggleLikeStmt = db.prepare<[{ id: string; liked: number; updatedAt: string }], Book>(`
  UPDATE books SET liked = @liked, updatedAt = @updatedAt WHERE id = @id RETURNING *
`);

export const bookRepo = {
  // ... existing methods ...

  toggleLike(id: string, liked: boolean): Book | undefined {
    return toggleLikeStmt.get({
      id,
      liked: liked ? 1 : 0,
      updatedAt: new Date().toISOString(),
    });
  },
};
```

**Step 6: Verify repository compiles**

Run: `cd backend && npm run build`
Expected: No errors

**Step 7: Commit**

```bash
git add backend/src/db/repositories/bookRepo.ts
git commit -m "feat(repo): add liked field handling and toggleLike method"
```

---

### Task 4: Update Controllers

**Files:**
- Modify: `backend/src/api/controllers/booksController.ts:153-179`

**Step 1: Update mapBookToResponse to include liked**

```typescript
async function mapBookToResponse(
  book: NonNullable<ReturnType<typeof bookRepo.findById>>,
): Promise<BookResponse> {
  const author = authorRepo.findById(book.authorId);
  const series = book.seriesId ? seriesRepo.findById(book.seriesId) : null;
  const files = fileRepo.findByBookId(book.id);

  return {
    id: book.id,
    title: book.title,
    originalTitle: book.originalTitle,
    slug: book.slug,
    description: book.description,
    isbn: book.isbn,
    firstPublishYear: book.firstPublishYear,
    liked: book.liked === 1,
    author: author
      ? { id: author.id, name: author.name, slug: author.slug }
      : { id: '', name: 'Unknown', slug: 'unknown' },
    series: series ? { id: series.id, name: series.name, slug: series.slug } : null,
    seriesOrder: book.seriesOrder,
    files: files
      .filter((f) => f.type === 'book')
      .map((f) => ({ id: f.id, format: f.format, size: f.size })),
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
}
```

**Step 2: Add toggleLike controller method**

```typescript
async function toggleBookLike(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { liked } = req.body;

    if (typeof liked !== 'boolean') {
      throw new ApiErrorClass('INVALID_INPUT', 'liked must be a boolean', 400);
    }

    const book = bookRepo.findById(id);
    if (!book) {
      throwNotFound('Book', id);
    }

    const updatedBook = bookRepo.toggleLike(id, liked);

    const response: ApiResponse<BookResponse> = {
      data: await mapBookToResponse(updatedBook!),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
```

**Step 3: Export toggleBookLike**

```typescript
export const booksController = {
  getBooks,
  getBookById,
  getBookFiles,
  searchBooks,
  getBooksByAuthor,
  getBooksBySeries,
  toggleBookLike,
};
```

**Step 4: Verify controller compiles**

Run: `cd backend && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add backend/src/api/controllers/booksController.ts
git commit -m "feat(controller): add liked field to book response and toggleLike endpoint"
```

---

### Task 5: Add API Route for Toggle Like

**Files:**
- Modify: `backend/src/api/routes/books.ts:173-203`

**Step 1: Add PUT /api/books/:id/like route**

Add before the final `export default router;`:

```typescript
/**
 * @openapi
 * /api/books/{id}/like:
 *   put:
 *     summary: Toggle book like status
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - liked
 *             properties:
 *               liked:
 *                 type: boolean
 *                 description: Whether the book is liked
 *     responses:
 *       200:
 *         description: Updated book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/like', booksController.toggleBookLike);
```

**Step 2: Verify routes compile**

Run: `cd backend && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add backend/src/api/routes/books.ts
git commit -m "feat(routes): add PUT /api/books/:id/like endpoint"
```

---

### Task 6: Update Swagger Schema

**Files:**
- Modify: `backend/src/config/swagger.ts:75-110`

**Step 1: Add liked property to Book schema**

```typescript
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
    liked: { type: 'boolean', example: false },
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
```

**Step 2: Verify swagger compiles**

Run: `cd backend && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add backend/src/config/swagger.ts
git commit -m "feat(swagger): add liked property to Book schema"
```

---

### Task 7: Update Other Controllers

**Files:**
- Modify: `backend/src/api/controllers/searchController.ts:44-73`
- Modify: `backend/src/api/controllers/authorsController.ts:64-84`
- Modify: `backend/src/api/controllers/seriesController.ts:61-83`

**Step 1: Update searchController mapBookToResponse**

Add `liked: book.liked === 1` to the return object.

**Step 2: Update authorsController getAuthorBooks**

Add `liked: book.liked === 1` to the book response mapping.

**Step 3: Update seriesController getSeriesBooks**

Add `liked: book.liked === 1` to the book response mapping.

**Step 4: Verify all compile**

Run: `cd backend && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add backend/src/api/controllers/searchController.ts backend/src/api/controllers/authorsController.ts backend/src/api/controllers/seriesController.ts
git commit -m "feat(controllers): add liked field to book responses in all controllers"
```

---

### Task 8: Update Integration Tests

**Files:**
- Modify: `backend/tests/integration/database.test.ts:50-66`

**Step 1: Add liked column to test schema**

Update the CREATE TABLE books statement in the test file:

```sql
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  originalTitle TEXT,
  slug TEXT NOT NULL,
  authorId TEXT NOT NULL,
  seriesId TEXT,
  seriesOrder INTEGER,
  description TEXT,
  isbn TEXT,
  firstPublishYear INTEGER,
  liked INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES authors(id) ON DELETE CASCADE,
  FOREIGN KEY (seriesId) REFERENCES series(id) ON DELETE SET NULL,
  UNIQUE(authorId, slug)
);
```

**Step 2: Run tests**

Run: `cd backend && npm test`
Expected: All tests pass

**Step 3: Commit**

```bash
git add backend/tests/integration/database.test.ts
git commit -m "test(db): add liked column to integration test schema"
```

---

## Part 2: Remove ISBN Field

### Task 9: Remove ISBN from Database Schema

**Files:**
- Modify: `backend/src/db/index.ts:49-65`

**Step 1: Remove isbn column from books table**

Remove the line `isbn TEXT,` from the CREATE TABLE statement.

**Step 2: Verify schema compiles**

Run: `cd backend && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add backend/src/db/index.ts
git commit -m "refactor(db): remove isbn column from books table"
```

---

### Task 10: Remove ISBN from Types

**Files:**
- Modify: `backend/src/types/db.ts:35-48` (Book interface)
- Modify: `backend/src/types/db.ts:102-113` (CreateBookInput)
- Modify: `backend/src/types/api.ts:21-47` (BookResponse)
- Modify: `backend/src/types/ai.ts:44-50` (MetadataBookOutput)
- Modify: `backend/src/types/agents.ts:96-104` (BookMetadata)

**Step 1: Remove isbn from all type interfaces**

Remove `isbn: string | null;` and `isbn?: string | null;` from all listed interfaces.

**Step 2: Verify types compile**

Run: `cd backend && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add backend/src/types/db.ts backend/src/types/api.ts backend/src/types/ai.ts backend/src/types/agents.ts
git commit -m "refactor(types): remove isbn field from all Book types"
```

---

### Task 11: Remove ISBN from Book Repository

**Files:**
- Modify: `backend/src/db/repositories/bookRepo.ts`

**Step 1: Remove isbn from createStmt**

Remove `isbn` from:
- Omit type
- The type definition object
- INSERT column list
- VALUES parameter list

**Step 2: Remove isbn from updateStmt**

Remove `isbn` from:
- The type definition object
- SET clause

**Step 3: Remove isbn from create method**

Remove the line: `isbn: input.isbn ?? null,`

**Step 4: Remove isbn from update method**

Remove the line: `isbn: input.isbn,`

**Step 5: Verify repository compiles**

Run: `cd backend && npm run build`
Expected: No errors

**Step 6: Commit**

```bash
git add backend/src/db/repositories/bookRepo.ts
git commit -m "refactor(repo): remove isbn field from book repository"
```

---

### Task 12: Remove ISBN from Controllers

**Files:**
- Modify: `backend/src/api/controllers/booksController.ts:153-179`
- Modify: `backend/src/api/controllers/searchController.ts:44-73`
- Modify: `backend/src/api/controllers/authorsController.ts:64-84`
- Modify: `backend/src/api/controllers/seriesController.ts:61-83`

**Step 1: Remove isbn from mapBookToResponse in booksController**

Remove line: `isbn: book.isbn,`

**Step 2: Remove isbn from mapBookToResponse in searchController**

Remove line: `isbn: book.isbn,`

**Step 3: Remove isbn from getAuthorBooks in authorsController**

Remove line: `isbn: book.isbn,`

**Step 4: Remove isbn from getSeriesBooks in seriesController**

Remove line: `isbn: book.isbn,`

**Step 5: Verify all compile**

Run: `cd backend && npm run build`
Expected: No errors

**Step 6: Commit**

```bash
git add backend/src/api/controllers/booksController.ts backend/src/api/controllers/searchController.ts backend/src/api/controllers/authorsController.ts backend/src/api/controllers/seriesController.ts
git commit -m "refactor(controllers): remove isbn field from book responses"
```

---

### Task 13: Remove ISBN from Swagger Schema

**Files:**
- Modify: `backend/src/config/swagger.ts:75-110`

**Step 1: Remove isbn from Book schema**

Remove the line: `isbn: { type: 'string', nullable: true },`

**Step 2: Verify swagger compiles**

Run: `cd backend && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add backend/src/config/swagger.ts
git commit -m "refactor(swagger): remove isbn from Book schema"
```

---

### Task 14: Remove ISBN from AI Services

**Files:**
- Modify: `backend/src/indexer/agents/metadataResolverAgent.ts:103-112`
- Modify: `backend/src/indexer/agents/metadataResolverAgent.ts:188-195`
- Modify: `backend/src/services/aiService.ts:250-256`

**Step 1: Remove isbn from metadataResolverAgent processResults**

Remove: `isbn: aiBook?.isbn || null,` from the books.set call.

**Step 2: Remove isbn from metadataResolverAgent storeResults**

Remove: `isbn: book.isbn,` from the bookRepo.update call.

**Step 3: Remove isbn from aiService logger**

Remove: `isbn: b.isbn,` from the logger output.

**Step 4: Verify all compile**

Run: `cd backend && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add backend/src/indexer/agents/metadataResolverAgent.ts backend/src/services/aiService.ts
git commit -m "refactor(ai): remove isbn field from metadata resolution"
```

---

### Task 15: Remove ISBN from Integration Tests

**Files:**
- Modify: `backend/tests/integration/database.test.ts:50-66`

**Step 1: Remove isbn from test schema**

Remove the line `isbn TEXT,` from the CREATE TABLE books statement.

**Step 2: Run tests**

Run: `cd backend && npm test`
Expected: All tests pass

**Step 3: Commit**

```bash
git add backend/tests/integration/database.test.ts
git commit -m "test(db): remove isbn column from integration test schema"
```

---

### Task 16: Final Verification

**Step 1: Run full build**

Run: `cd backend && npm run build`
Expected: No errors

**Step 2: Run all tests**

Run: `cd backend && npm test`
Expected: All tests pass

**Step 3: Search for any remaining isbn references**

Run: `cd backend && grep -ri "isbn" src/ tests/`
Expected: No matches

**Step 4: Final commit (if needed)**

```bash
git add -A
git commit -m "chore: cleanup after like feature and isbn removal"
```

---

## Summary of Changes

**Files Modified:**
1. `backend/src/db/index.ts` - Schema changes
2. `backend/src/types/db.ts` - Type definitions
3. `backend/src/types/api.ts` - API types
4. `backend/src/types/ai.ts` - AI types
5. `backend/src/types/agents.ts` - Agent types
6. `backend/src/db/repositories/bookRepo.ts` - Repository logic
7. `backend/src/api/controllers/booksController.ts` - Book controller
8. `backend/src/api/controllers/searchController.ts` - Search controller
9. `backend/src/api/controllers/authorsController.ts` - Authors controller
10. `backend/src/api/controllers/seriesController.ts` - Series controller
11. `backend/src/api/routes/books.ts` - API routes
12. `backend/src/config/swagger.ts` - Swagger documentation
13. `backend/src/indexer/agents/metadataResolverAgent.ts` - AI agent
14. `backend/src/services/aiService.ts` - AI service
15. `backend/tests/integration/database.test.ts` - Tests

**New API Endpoint:**
- `PUT /api/books/:id/like` - Toggle book like status
  - Request body: `{ "liked": boolean }`
  - Response: Updated book object
