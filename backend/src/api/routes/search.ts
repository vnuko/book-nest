import { Router } from 'express';
import { searchController } from '../controllers/searchController.js';

const router = Router();

/**
 * @openapi
 * /api/search:
 *   get:
 *     summary: Global search across books, authors, and series
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 */
router.get('/', searchController.search);

export default router;
