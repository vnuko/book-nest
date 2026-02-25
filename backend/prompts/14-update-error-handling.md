# Prompt 14: Add Helper Methods and Update Error Handling

## GitHub Issue
[#13 - Batch processing refactoring](https://github.com/vnuko/book-nest/issues/13)

## Objective
Add the helper methods referenced in Prompt 13 and improve error handling for granular item tracking.

---

## File: `src/indexer/batchProcessor.ts`

### Add New Interface (near the top of the file, after existing interfaces):

```typescript
interface PersistResult {
  successful: Array<{ filePath: string }>;
  failed: Array<{ filePath: string; error: string }>;
}
```

---

### Replace `persistToDatabase()` Method (lines 414-509)

Replace the existing `persistToDatabase()` method with a new version that tracks success/failure per item:

```typescript
private async persistToDatabaseWithTracking(
  batchId: string,
  nameResults: NameResolverAgentResult[],
  batchLogger: ReturnType<typeof createBatchLogger>
): Promise<PersistResult> {
  const result: PersistResult = {
    successful: [],
    failed: [],
  };

  const processedAuthors = new Set<string>();
  const processedSeries = new Set<string>();
  const processedBooks = new Set<string>();
  const authorIdMap = new Map<string, string>();
  const seriesIdMap = new Map<string, string>();
  const bookIdMap = new Map<string, string>();

  for (const nameResult of nameResults) {
    try {
      const authorSlug = nameResult.author.slug;

      // Process Author
      if (!processedAuthors.has(authorSlug)) {
        const existingAuthor = authorRepo.findBySlug(authorSlug);

        if (!existingAuthor) {
          const authorId = generateAuthorId();
          authorIdMap.set(authorSlug, authorId);
          authorRepo.create({
            id: authorId,
            name: nameResult.author.normalizedName,
            slug: nameResult.author.slug,
          });
          batchLogger.debug('Created author', { name: nameResult.author.normalizedName, id: authorId });
        } else {
          authorIdMap.set(authorSlug, existingAuthor.id);
        }
        processedAuthors.add(authorSlug);
      }

      const authorId = authorIdMap.get(authorSlug)!;

      // Process Series
      let seriesId: string | null = null;
      if (nameResult.series.slug) {
        const seriesKey = `${authorSlug}/${nameResult.series.slug}`;

        if (!processedSeries.has(seriesKey)) {
          const existingSeries = seriesRepo.findBySlug(nameResult.series.slug);

          if (!existingSeries) {
            seriesId = generateSeriesId();
            seriesIdMap.set(seriesKey, seriesId);
            seriesRepo.create({
              id: seriesId,
              name: nameResult.series.englishName!,
              originalName: nameResult.series.originalName,
              slug: nameResult.series.slug,
              authorId,
            });
            batchLogger.debug('Created series', { name: nameResult.series.englishName, id: seriesId });
          } else {
            seriesIdMap.set(seriesKey, existingSeries.id);
          }
          processedSeries.add(seriesKey);
        }
        seriesId = seriesIdMap.get(seriesKey)!;
      }

      // Process Book
      const bookKey = `${authorSlug}/${nameResult.title.slug}`;

      if (!processedBooks.has(bookKey)) {
        const bookId = generateBookId();
        bookIdMap.set(bookKey, bookId);
        bookRepo.create({
          id: bookId,
          title: nameResult.title.englishTitle,
          originalTitle: nameResult.title.originalTitle,
          slug: nameResult.title.slug,
          authorId,
          seriesId,
        });
        batchLogger.debug('Created book', { title: nameResult.title.englishTitle, id: bookId });
        processedBooks.add(bookKey);
      }

      const bookId = bookIdMap.get(bookKey)!;

      // Create File Record
      fileRepo.create({
        id: generateFileId(),
        bookId,
        type: 'book',
        format: nameResult.format,
        path: nameResult.filePath,
        sha256: nameResult.sha256,
      });

      // Copy file to ebooks folder
      await fileOrganizer.copyFile(
        nameResult.filePath,
        nameResult.author.slug,
        nameResult.title.slug,
        nameResult.sha256,
        nameResult.format
      );

      // Mark as successful
      result.successful.push({ filePath: nameResult.filePath });
      batchLogger.debug('Item persisted successfully', { filePath: nameResult.filePath });

    } catch (error) {
      const errorMessage = (error as Error).message;
      batchLogger.error('Failed to persist item', error as Error, {
        filePath: nameResult.filePath,
      });
      result.failed.push({
        filePath: nameResult.filePath,
        error: errorMessage,
      });
    }
  }

  return result;
}
```

---

### Add New Method: `moveProcessedFiles()`

Add this new method after the `persistToDatabaseWithTracking()` method:

```typescript
private async moveProcessedFiles(
  successfulItems: Array<{ filePath: string }>,
  batchLogger: ReturnType<typeof createBatchLogger>
): Promise<void> {
  const filePaths = successfulItems.map((item) => item.filePath);
  const sourceBaseDir = config.paths.source;
  const processedDir = config.paths.processed;

  try {
    const results = await fileOrganizer.moveProcessedFiles(
      filePaths,
      sourceBaseDir,
      processedDir
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    batchLogger.info('Files moved to processed folder', {
      total: filePaths.length,
      successful: successful.length,
      failed: failed.length,
    });

    // Log any failures
    for (const failure of failed) {
      batchLogger.warn('Failed to move file to processed folder', {
        originalPath: failure.originalPath,
        error: failure.error,
      });
    }
  } catch (error) {
    batchLogger.error('Batch file move failed', error as Error, {
      fileCount: filePaths.length,
    });
    // Don't throw - file move failure shouldn't fail the batch
  }
}
```

---

### Update `processBatches()` Method (lines 246-282)

Modify error handling to not throw on individual batch failures, but track them:

```typescript
private async processBatches(
  batchId: string,
  items: Array<{
    id: string;
    batchId: string;
    path: string;
    sha256: string;
    format: EbookFormat;
  }>,
  batchLogger: ReturnType<typeof createBatchLogger>
): Promise<{ total: number; processed: number; failed: number; errors: string[] }> {
  const results = { total: items.length, processed: 0, failed: 0, errors: [] as string[] };

  for (let i = 0; i < items.length; i += this.batchSize) {
    const batchItems = items.slice(i, i + this.batchSize);
    batchLogger.info(`Processing batch ${Math.floor(i / this.batchSize) + 1}`, {
      start: i,
      end: Math.min(i + this.batchSize, items.length),
      count: batchItems.length,
    });

    try {
      await this.processSingleBatch(batchId, batchItems, batchLogger);
      
      // Count successful vs failed items from this batch
      const batchItemsStatus = batchItems.map((item) => batchRepo.findItemById(item.id));
      const successfulInBatch = batchItemsStatus.filter((item) => 
        item && item.status !== 'failed'
      ).length;
      const failedInBatch = batchItemsStatus.filter((item) => 
        item && item.status === 'failed'
      ).length;
      
      results.processed += successfulInBatch;
      results.failed += failedInBatch;
      
      batchLogger.info(`Batch ${Math.floor(i / this.batchSize) + 1} completed`, {
        successful: successfulInBatch,
        failed: failedInBatch,
      });
    } catch (error) {
      // Critical error - entire batch failed
      results.failed += batchItems.length;
      results.errors.push((error as Error).message);
      batchLogger.error('Batch failed critically', error as Error, { batchIndex: i });
      // Mark batch as failed but continue with next batch if possible
      // Note: We don't throw here anymore to allow processing other batches
    }

    batchRepo.update(batchId, { processedBooks: results.processed });
  }

  return results;
}
```

---

### Update Import for config (line 5)

Make sure config is imported:

```typescript
import { config } from '../config/index.js';
```

---

## Verification
After applying changes:
1. Run `npm run build` - should compile without errors
2. The new methods should be available
3. Error handling should track individual item failures

---

## Dependencies
- Requires Prompt 10 (config.paths.processed)
- Requires Prompt 12 (moveProcessedFile method)
- Requires Prompt 13 (phase order refactoring)
- This prompt should be executed AFTER Prompt 13
