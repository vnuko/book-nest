# Prompt 13: Refactor Phase Order in BatchProcessor

## GitHub Issue
[#13 - Batch processing refactoring](https://github.com/vnuko/book-nest/issues/13)

## Objective
Reorder the phases in `processSingleBatch()` to implement the new flow:
- Name Resolution → Image Resolution + Persist + Move → Metadata Resolution → File Conversion

---

## File: `src/indexer/batchProcessor.ts`

### Current Phase Order (lines 284-349):
```
Phase 1: Name Resolution
Phase 2: Persist to DB        ← MOVE AFTER IMAGE
Phase 3: Image Resolution     ← MOVE BEFORE PERSIST
Phase 4: Metadata Resolution
Phase 5: File Conversion
```

### New Phase Order:
```
Phase 1: Name Resolution
Phase 2: Image Resolution + Persist to DB + Move to Processed
Phase 3: Metadata Resolution
Phase 4: File Conversion
```

---

### Complete Replacement of `processSingleBatch()` Method:

Replace the entire `processSingleBatch()` method (approximately lines 284-349) with:

```typescript
private async processSingleBatch(
  batchId: string,
  items: Array<{ id: string; path: string; sha256: string; format: EbookFormat }>,
  batchLogger: ReturnType<typeof createBatchLogger>,
  fastMode: boolean = false
): Promise<void> {
  batchLogger.info('Phase 1: Name Resolution STARTING', { itemCount: items.length });

  const nameResults = await nameResolverAgent.execute({
    batchId,
    files: items.map((item) => ({
      id: item.id,
      path: item.path,
      sha256: item.sha256,
      format: item.format,
    })),
  });
  batchLogger.info('Phase 1: Name Resolution COMPLETED', { resultCount: nameResults.length });

  // Update item status after name resolution
  for (const result of nameResults) {
    const item = items.find((i) => i.path === result.filePath);
    if (item) {
      await batchRepo.updateItemStatus(item.id, 'name_resolved');
    }
  }

  if (!fastMode) {
    const groupedByName = this.groupByNameResults(nameResults);

    batchLogger.info('Phase 2: Image Resolution STARTING', {
      authorCount: groupedByName.authors.size,
      bookCount: groupedByName.books.length,
    });

    // Step 2a: Image Resolution (this also creates folder structure)
    await imageResolverAgent.execute({
      batchId,
      authors: Array.from(groupedByName.authors.values()),
      books: groupedByName.books,
    });
    batchLogger.info('Phase 2: Image Resolution COMPLETED');

    // Step 2b: Persist to Database
    batchLogger.info('Phase 2: Persisting to database STARTING');
    const persistResults = await this.persistToDatabaseWithTracking(batchId, nameResults, batchLogger);
    batchLogger.info('Phase 2: Persisting to database COMPLETED', {
      successful: persistResults.successful.length,
      failed: persistResults.failed.length,
    });

    // Step 2c: Move successfully persisted files to processed folder
    if (persistResults.successful.length > 0) {
      batchLogger.info('Phase 2: Moving processed files STARTING', {
        fileCount: persistResults.successful.length,
      });
      await this.moveProcessedFiles(persistResults.successful, batchLogger);
      batchLogger.info('Phase 2: Moving processed files COMPLETED');
    }

    // Mark successful items as persisted
    for (const result of persistResults.successful) {
      const item = items.find((i) => i.path === result.filePath);
      if (item) {
        await batchRepo.updateItemStatus(item.id, 'persisted');
      }
    }

    // Mark failed items
    for (const result of persistResults.failed) {
      const item = items.find((i) => i.path === result.filePath);
      if (item) {
        await batchRepo.updateItemStatus(item.id, 'failed', undefined, result.error);
        batchLogger.warn('Item failed during persist', {
          filePath: result.filePath,
          error: result.error,
        });
      }
    }

    // Continue with remaining phases only for successful items
    const successfulNameResults = nameResults.filter((r) =>
      persistResults.successful.some((s) => s.filePath === r.filePath)
    );

    if (successfulNameResults.length > 0) {
      const successfulGrouped = this.groupByNameResults(successfulNameResults);

      // Phase 3: Metadata Resolution (non-blocking)
      batchLogger.info('Phase 3: Metadata Resolution STARTING');
      try {
        await metadataResolverAgent.execute({
          batchId,
          authors: Array.from(successfulGrouped.authors.values()),
          books: successfulGrouped.books.map((b) => ({
            title: b.originalTitle,
            englishTitle: b.englishTitle,
            authorName: b.authorName,
            authorSlug: b.authorSlug,
            bookSlug: b.bookSlug,
          })),
          series: successfulGrouped.series,
        });
        batchLogger.info('Phase 3: Metadata Resolution COMPLETED');
      } catch (error) {
        batchLogger.error('Phase 3: Metadata Resolution FAILED (non-blocking)', error as Error);
        // Continue processing - metadata is optional enhancement
      }

      // Phase 4: File Conversion (non-blocking)
      batchLogger.info('Phase 4: File Conversion STARTING');
      try {
        await this.convertFiles(successfulNameResults, batchLogger);
        batchLogger.info('Phase 4: File Conversion COMPLETED');
      } catch (error) {
        batchLogger.error('Phase 4: File Conversion FAILED (non-blocking)', error as Error);
        // Continue processing - conversion is optional enhancement
      }
    }
  }

  // Mark all successful items as completed
  for (const item of items) {
    const failedItem = await batchRepo.findItemById(item.id);
    if (failedItem && failedItem.status !== 'failed') {
      await batchRepo.updateItemStatus(item.id, 'completed');
    }
  }
}
```

---

### Key Changes:

1. **Phase 2 combines three operations:**
   - Image Resolution (creates folders, downloads images)
   - Persist to Database
   - Move to Processed folder

2. **Tracking persists separately:**
   - `persistToDatabaseWithTracking()` returns which items succeeded/failed
   - Failed items are marked with error messages
   - Successful items proceed to phases 3 & 4

3. **Non-blocking phases 3 & 4:**
   - Wrapped in try-catch
   - Errors logged but don't stop processing
   - Processing continues for successful items

4. **Item status updates:**
   - `name_resolved` after phase 1
   - `persisted` after phase 2 success
   - `failed` after phase 2 failure (with error message)
   - `completed` at the end (if not failed)

---

## New Status Values Needed

Update `src/types/db.ts` to add new status:

```typescript
export type BatchItemStatus =
  | 'pending'
  | 'name_resolved'
  | 'persisted'        // NEW - after successful DB persist
  | 'images_fetched'
  | 'metadata_fetched'
  | 'completed'
  | 'failed';
```

Update `src/db/index.ts` schema check constraint:

```sql
status TEXT NOT NULL CHECK(status IN ('pending', 'name_resolved', 'persisted', 'images_fetched', 'metadata_fetched', 'completed', 'failed')),
```

---

## Verification
After applying changes:
1. Run `npm run build` - should compile without errors
2. The new phase order should be in place

---

## Dependencies
- Requires Prompt 10 (config.paths.processed)
- Requires Prompt 12 (moveProcessedFile method)
- This prompt should be executed BEFORE Prompt 14

---

## Note
This prompt only changes the phase structure. Prompt 14 will add the helper methods (`persistToDatabaseWithTracking`, `moveProcessedFiles`) referenced here.
