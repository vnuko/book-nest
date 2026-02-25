# Batch Processing Refactoring - Prompt Train README

This folder contains executable prompts to refactor the batch processing flow.

## GitHub Issue
[#13](https://github.com/vnuko/book-nest/issues/13)

## Prompts Execution Order

| # | Prompt File | Description |
|---|-------------|
| 10 | `10-add-processed-path-config.md` | Add `PROCESSED_PATH` config |
| 11 | `11-update-crawler-exclusion.md` | Update crawler to exclude processed folder |
| 12 | `12-add-move-processed-method.md` | Add `moveProcessedFile()` method |
| 13 | `13-refactor-phase-order.md` | Refactor phase order |
| 14 | `14-update-error-handling.md` | Add helper methods and improve error handling |
| 15 | `README-refactoring.md` | Summary and checklist |

---

## Changes Summary

| File | Change |
|------|--------|
| `src/config/index.ts` | Add `processed` path |
| `src/indexer/crawler.ts` | Exclude processed folder from discovery |
| `src/indexer/fileOrganizer.ts` | Add `moveProcessedFile()` method |
| `src/indexer/batchProcessor.ts` | Reorder phases, add file move, improve error handling |
| `src/types/db.ts` | Add `persisted` status |
| `src/db/index.ts` | Update status constraint |
            `.env.example` | Add `PROCESSED_PATH` example |

## Execution Order
| Prompt | Dependencies |
|------|-------------|
| 10 | Required |
| 11 | Required |
    12 | Required |
    13 | Required |
    14 | Required |
    15 | Run build & verify |

---

**Full details for each prompt are below.**
