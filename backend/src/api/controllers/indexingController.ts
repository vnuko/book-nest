import type { Request, Response, NextFunction } from 'express';
import { batchProcessor } from '../../indexer/batchProcessor.js';
import { batchRepo } from '../../db/repositories/index.js';
import { parsePagination, calculateOffset, buildPaginationResult } from '../../utils/index.js';
import { throwNotFound, ApiErrorClass } from '../middleware/errorHandler.js';

async function startIndexing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const runningBatch = batchRepo.findByStatus('processing');
    if (runningBatch.length > 0) {
      throw new ApiErrorClass(
        'INDEXING_IN_PROGRESS',
        `Indexing already in progress. Batch ID: ${runningBatch[0].id}`,
        409,
      );
    }

    const result = await batchProcessor.startIndexing();

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getIndexingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batches = batchRepo.findByStatus('processing');

    let currentBatch = null;
    if (batches.length > 0) {
      currentBatch = batchProcessor.getStatus(batches[0].id);
    }

    const lastBatches = batchRepo.findAll(5, 0);
    const lastBatch = lastBatches.find((b) => b.status !== 'processing');

    res.json({
      data: {
        isRunning: batches.length > 0,
        currentBatch,
        lastBatch: lastBatch
          ? {
              batchId: lastBatch.id,
              status: lastBatch.status,
              totalBooks: lastBatch.totalBooks,
              processedBooks: lastBatch.processedBooks,
              failedBooks: lastBatch.failedBooks,
              completedAt: lastBatch.completedAt,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getIndexingHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit } = parsePagination(
      req.query.page as string,
      req.query.limit as string,
    );
    const offset = calculateOffset(page, limit);

    const batches = batchRepo.findAll(limit, offset);
    const total = batches.length;

    res.json({
      data: batches.map((b) => ({
        batchId: b.id,
        status: b.status,
        totalBooks: b.totalBooks,
        processedBooks: b.processedBooks,
        failedBooks: b.failedBooks,
        startedAt: b.startedAt,
        completedAt: b.completedAt,
        createdAt: b.createdAt,
      })),
      pagination: buildPaginationResult(page, limit, total),
    });
  } catch (error) {
    next(error);
  }
}

async function cancelBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const batch = batchRepo.findById(id);
    if (!batch) {
      throwNotFound('Batch', id);
    }

    if (batch.status !== 'processing' && batch.status !== 'pending') {
      throw new ApiErrorClass(
        'BATCH_NOT_CANCELLABLE',
        `Cannot cancel batch with status '${batch.status}'`,
        400,
      );
    }

    await batchProcessor.rollback(id);

    res.json({
      data: {
        batchId: id,
        status: 'rolled_back',
        message: 'Batch cancelled and rolled back successfully',
      },
    });
  } catch (error) {
    next(error);
  }
}

export const indexingController = {
  startIndexing,
  getIndexingStatus,
  getIndexingHistory,
  cancelBatch,
};
