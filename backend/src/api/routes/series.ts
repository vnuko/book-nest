import { Router } from 'express';
import { seriesController } from '../controllers/seriesController.js';

const router = Router();

/**
 * @openapi
 * /api/series:
 *   get:
 *     summary: Get all series
 *     tags: [Series]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of series
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeriesListResponse'
 */
router.get('/', seriesController.getSeries);

/**
 * @openapi
 * /api/series/search:
 *   get:
 *     summary: Search series
 *     tags: [Series]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeriesListResponse'
 */
router.get('/search', seriesController.searchSeries);

/**
 * @openapi
 * /api/series/{id}:
 *   get:
 *     summary: Get series by ID
 *     tags: [Series]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Series details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Series'
 *       404:
 *         description: Series not found
 */
router.get('/:id', seriesController.getSeriesById);

/**
 * @openapi
 * /api/series/{id}/books:
 *   get:
 *     summary: Get books in series
 *     tags: [Series]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Books in series
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookListResponse'
 */
router.get('/:id/books', seriesController.getSeriesBooks);

export default router;
