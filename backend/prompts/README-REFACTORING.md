# Batch Processing Refactoring - Prompt Train

This prompt train refactors the batch processing flow to implement proper transactional indexing with file archival.

## GitHub Issue
[#13 - Batch processing with file archival](https://github.com/vnuko/book-nest/issues/13)

## New Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: NAME RESOLUTION                                       │
│  • Input: 25 file paths                                         │
│  • Action: 1 AI call to Gemini                                  │
│  • Output: Author name, Book title, Series (with slugs)         │
│  • Status: Items marked as "name_resolved"                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: IMAGE + PERSIST + ARCHIVE                             │
│  Step 2a: Create folder structure (ebooks/author/book/)         │
│  Step 2b: Download author images + book covers                  │
│  Step 2c: Copy files to ebooks folder                           │
│  Step 2d: Persist to database (authors, books, series, files)   │
│  Step 2e: Move source files to processed folder                 │
│  • Status: Items marked as "persisted"                          │
│  ⚠️ IF FAILS: Mark item as "failed" with error, continue batch │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: METADATA RESOLUTION                                   │
│  • Action: UPDATE existing DB records                           │
│  • Status: Items marked as "metadata_fetched"                   │
│  ⚠️ IF FAILS: Log error, continue (non-blocking)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: FILE CONVERSION                                       │
│  • Convert books to other formats using Calibre                 │
│  • Status: Items marked as "completed"                          │
│  ⚠️ IF FAILS: Log error, continue (non-blocking)               │
└─────────────────────────────────────────────────────────────────┘
```

## File Movement

```
BEFORE:                          AFTER:
source/                          source/
├── author1/                     ├── processed/
│   ├── book1.epub    ───────►   │   └── author1/
│   └── book2.mobi    ───────►   │       ├── book1.epub
└── author2/                     │       └── book2.mobi
    └── book3.epub    ───────►   └── author2/
                                     └── book3.epub
```

## Execution Order

Execute prompts in order:

| # | File | Description |
|---|------|-------------|
| 10 | `10-add-processed-path-config.md` | Add PROCESSED_PATH to config |
| 11 | `11-update-crawler-exclusion.md` | Exclude processed folder from crawler |
| 12 | `12-add-move-processed-method.md` | Add file archival method to fileOrganizer |
| 13 | `13-refactor-phase-order.md` | Reorder phases in batchProcessor |
| 14 | `14-update-error-handling.md` | Add helper methods and improve error handling |

## Files Modified

| File | Change |
|------|--------|
| `src/config/index.ts` | Add `processedPath` |
| `src/indexer/crawler.ts` | Exclude processed folder from discovery |
| `src/indexer/fileOrganizer.ts` | Add `moveProcessedFile()` method |
| `src/indexer/batchProcessor.ts` | Reorder phases, add file move, improve error handling |
| `src/types/db.ts` | Add `persisted` status |
| `src/db/index.ts` | Update status constraint |
| `.env.example` | Add `PROCESSED_PATH` |

## Error Handling

| Scenario | Action |
|----------|--------|
| Phase 1 fails (AI error) | Mark all items failed, log error |
| Phase 2 fails for 1 file | Mark that item failed, continue with others |
| Phase 3 fails | Log error, continue to Phase 4 |
| Phase 4 fails | Log error, mark batch complete |
| Move to processed fails | Mark item failed, file stays in source |

## Batch Item Status Values

| Status | When Set |
|--------|----------|
| `pending` | Initial state |
| `name_resolved` | After Phase 1 |
| `persisted` | After Phase 2 success |
| `failed` | After any phase failure |
| `completed` | After all phases |
