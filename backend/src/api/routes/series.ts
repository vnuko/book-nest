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

/**
 * @openapi
 * /api/series/{id}:
 *   put:
 *     summary: Update series details
 *     tags: [Series]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Series ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Series name (required, non-empty)
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Series description (empty string sets to null)
 *               originalName:
 *                 type: string
 *                 nullable: true
 *                 description: Original series name (empty string sets to null)
 *     responses:
 *       200:
 *         description: Updated series
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Series'
 *       400:
 *         description: Invalid input (e.g., empty name)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Series not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', seriesController.updateSeries);

/**
 * @openapi
 * /api/series/{id}:
 *   delete:
 *     summary: Delete a series
 *     description: Deletes the series, its image, and unlinks all books from the series. Books are NOT deleted.
 *     tags: [Series]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Series ID
 *     responses:
 *       200:
 *         description: Series deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Series not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', seriesController.deleteSeries);

export default router;
