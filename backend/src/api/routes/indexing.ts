import { Router } from 'express';
import { indexingController } from '../controllers/indexingController.js';

const router = Router();

/**
 * @openapi
 * /api/indexing/start:
 *   post:
 *     summary: Start or resume indexing process
 *     description: |
 *       Starts indexing from the source folder configured in .env (SOURCE_PATH).
 *       If a previous batch failed or was interrupted, automatically resumes from where it left off.
 *     tags: [Indexing]
 *     responses:
 *       200:
 *         description: Indexing started or resumed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     batchId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     resumed:
 *                       type: boolean
 *                     totalBooks:
 *                       type: integer
 *                     processedBooks:
 *                       type: integer
 */
router.post('/start', indexingController.startIndexing);

/**
 * @openapi
 * /api/indexing/status:
 *   get:
 *     summary: Get current indexing status
 *     tags: [Indexing]
 *     responses:
 *       200:
 *         description: Indexing status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/IndexingStatus'
 */
router.get('/status', indexingController.getIndexingStatus);

/**
 * @openapi
 * /api/indexing/history:
 *   get:
 *     summary: Get indexing history
 *     tags: [Indexing]
 *     responses:
 *       200:
 *         description: Indexing history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IndexingHistory'
 */
router.get('/history', indexingController.getIndexingHistory);

/**
 * @openapi
 * /api/indexing/batch/{id}:
 *   delete:
 *     summary: Cancel an indexing batch
 *     tags: [Indexing]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Batch cancelled
 *       404:
 *         description: Batch not found
 */
router.delete('/batch/:id', indexingController.cancelBatch);

export default router;
