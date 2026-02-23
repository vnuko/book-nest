import { Router } from 'express';
import { overviewController } from '../controllers/overviewController.js';

const router = Router();

/**
 * @openapi
 * /api/overview:
 *   get:
 *     summary: Get library overview
 *     tags: [Overview]
 *     responses:
 *       200:
 *         description: Library overview statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Overview'
 */
router.get('/', overviewController.getOverview);

export default router;
