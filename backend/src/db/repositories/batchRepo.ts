import { db } from '../index.js';
import type {
  IndexingBatch,
  IndexingBatchItem,
  CreateBatchInput,
  CreateBatchItemInput,
  BatchStatus,
  BatchItemStatus,
} from '../../types/db.js';
import type Database from 'better-sqlite3';

type RunResult = Database.RunResult;

const findBatchByIdStmt = db.prepare(`
  SELECT * FROM indexing_batches WHERE id = ?
`);

const findLatestBatchStmt = db.prepare(`
  SELECT * FROM indexing_batches ORDER BY createdAt DESC LIMIT 1
`);

const findBatchesByStatusStmt = db.prepare(`
  SELECT * FROM indexing_batches WHERE status = ? ORDER BY createdAt DESC
`);

const findAllBatchesStmt = db.prepare(`
  SELECT * FROM indexing_batches ORDER BY createdAt DESC LIMIT ? OFFSET ?
`);

const createBatchStmt = db.prepare(`
  INSERT INTO indexing_batches (id, status, totalBooks, processedBooks, failedBooks)
  VALUES (?, 'pending', ?, 0, 0)
  RETURNING *
`);

const updateBatchStatusStmt = db.prepare(`
  UPDATE indexing_batches SET
    status = ?,
    processedBooks = COALESCE(?, processedBooks),
    failedBooks = COALESCE(?, failedBooks)
  WHERE id = ?
  RETURNING *
`);

const startProcessingStmt = db.prepare(`
  UPDATE indexing_batches SET status = 'processing', startedAt = ? WHERE id = ?
  RETURNING *
`);

const completeBatchStmt = db.prepare(`
  UPDATE indexing_batches SET status = 'completed', completedAt = ? WHERE id = ?
  RETURNING *
`);

const failBatchStmt = db.prepare(`
  UPDATE indexing_batches SET status = 'failed', completedAt = ? WHERE id = ?
  RETURNING *
`);

const markRolledBackStmt = db.prepare(`
  UPDATE indexing_batches SET status = 'rolled_back' WHERE id = ?
  RETURNING *
`);

const findItemByIdStmt = db.prepare(`
  SELECT * FROM indexing_batch_items WHERE id = ?
`);

const findItemsByBatchIdStmt = db.prepare(`
  SELECT * FROM indexing_batch_items WHERE batchId = ? ORDER BY createdAt
`);

const findPendingItemsStmt = db.prepare(`
  SELECT * FROM indexing_batch_items WHERE batchId = ? AND status = 'pending' ORDER BY createdAt
`);

const findIncompleteItemsStmt = db.prepare(`
  SELECT * FROM indexing_batch_items WHERE batchId = ? AND status != 'completed' ORDER BY createdAt
`);

const createItemStmt = db.prepare(`
  INSERT INTO indexing_batch_items (id, batchId, filePath, sourceSha256, status)
  VALUES (?, ?, ?, ?, 'pending')
  RETURNING *
`);

const updateItemStatusStmt = db.prepare(`
  UPDATE indexing_batch_items SET
    status = ?,
    agentResults = COALESCE(?, agentResults),
    errorMessage = COALESCE(?, errorMessage)
  WHERE id = ?
  RETURNING *
`);

const countItemsByStatusStmt = db.prepare(`
  SELECT COUNT(*) as count FROM indexing_batch_items WHERE batchId = ? AND status = ?
`);

export const batchRepo = {
  findById(id: string): IndexingBatch | undefined {
    return findBatchByIdStmt.get(id) as IndexingBatch | undefined;
  },

  findLatest(): IndexingBatch | undefined {
    return findLatestBatchStmt.get() as IndexingBatch | undefined;
  },

  findByStatus(status: BatchStatus): IndexingBatch[] {
    return findBatchesByStatusStmt.all(status) as IndexingBatch[];
  },

  findAll(limit: number, offset: number): IndexingBatch[] {
    return findAllBatchesStmt.all(limit, offset) as IndexingBatch[];
  },

  create(input: CreateBatchInput): IndexingBatch {
    return createBatchStmt.get(input.id, input.totalBooks) as IndexingBatch;
  },

  update(id: string, data: { totalBooks?: number; processedBooks?: number }): RunResult {
    if (data.totalBooks !== undefined) {
      return db.prepare('UPDATE indexing_batches SET totalBooks = ? WHERE id = ?').run(data.totalBooks, id);
    }
    if (data.processedBooks !== undefined) {
      return db.prepare('UPDATE indexing_batches SET processedBooks = ? WHERE id = ?').run(data.processedBooks, id);
    }
    return { changes: 0, lastInsertRowid: 0n } as RunResult;
  },

  updateStatus(
    id: string,
    status: BatchStatus,
    processedBooks?: number,
    failedBooks?: number,
  ): IndexingBatch {
    return updateBatchStatusStmt.get(
      status,
      processedBooks ?? null,
      failedBooks ?? null,
      id,
    ) as IndexingBatch;
  },

  startProcessing(id: string): IndexingBatch {
    return startProcessingStmt.get(new Date().toISOString(), id) as IndexingBatch;
  },

  complete(id: string): IndexingBatch {
    return completeBatchStmt.get(new Date().toISOString(), id) as IndexingBatch;
  },

  fail(id: string): IndexingBatch {
    return failBatchStmt.get(new Date().toISOString(), id) as IndexingBatch;
  },

  markRolledBack(id: string): IndexingBatch {
    return markRolledBackStmt.get(id) as IndexingBatch;
  },

  findItemById(id: string): IndexingBatchItem | undefined {
    return findItemByIdStmt.get(id) as IndexingBatchItem | undefined;
  },

  findItemsByBatchId(batchId: string): IndexingBatchItem[] {
    return findItemsByBatchIdStmt.all(batchId) as IndexingBatchItem[];
  },

  findPendingItems(batchId: string): IndexingBatchItem[] {
    return findPendingItemsStmt.all(batchId) as IndexingBatchItem[];
  },

  findIncompleteItems(batchId: string): IndexingBatchItem[] {
    return findIncompleteItemsStmt.all(batchId) as IndexingBatchItem[];
  },

  createItem(input: CreateBatchItemInput): IndexingBatchItem {
    return createItemStmt.get(
      input.id,
      input.batchId,
      input.filePath,
      input.sourceSha256 ?? null,
    ) as IndexingBatchItem;
  },

  updateItemStatus(
    id: string,
    status: BatchItemStatus,
    agentResults?: string,
    errorMessage?: string,
  ): IndexingBatchItem {
    return updateItemStatusStmt.get(
      status,
      agentResults ?? null,
      errorMessage ?? null,
      id,
    ) as IndexingBatchItem;
  },

  countItemsByStatus(batchId: string, status: BatchItemStatus): number {
    const result = countItemsByStatusStmt.get(batchId, status) as { count: number };
    return result.count;
  },
};
