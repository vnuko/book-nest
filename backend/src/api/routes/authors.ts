import { Router } from 'express';
import { authorsController } from '../controllers/authorsController.js';

const router = Router();

/**
 * @openapi
 * /api/authors:
 *   get:
 *     summary: Get all authors
 *     tags: [Authors]
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
 *         description: List of authors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorListResponse'
 */
router.get('/', authorsController.getAuthors);

/**
 * @openapi
 * /api/authors/search:
 *   get:
 *     summary: Search authors
 *     tags: [Authors]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
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
 *               $ref: '#/components/schemas/AuthorListResponse'
 */
router.get('/search', authorsController.searchAuthors);

/**
 * @openapi
 * /api/authors/{id}:
 *   get:
 *     summary: Get author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 */
router.get('/:id', authorsController.getAuthorById);

/**
 * @openapi
 * /api/authors/{id}/books:
 *   get:
 *     summary: Get books by author
 *     tags: [Authors]
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
 *         description: Books by author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookListResponse'
 */
router.get('/:id/books', authorsController.getAuthorBooks);

/**
 * @openapi
 * /api/authors/{id}/series:
 *   get:
 *     summary: Get series by author
 *     tags: [Authors]
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
 *         description: Series by author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeriesListResponse'
 */
router.get('/:id/series', authorsController.getAuthorSeries);

/**
 * @openapi
 * /api/authors/{id}:
 *   put:
 *     summary: Update author details
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Author ID
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
 *                 description: Author name (required, non-empty)
 *               bio:
 *                 type: string
 *                 nullable: true
 *                 description: Author biography (empty string sets to null)
 *               dateOfBirth:
 *                 type: string
 *                 nullable: true
 *                 description: Date of birth (e.g., "1980-05-15")
 *               nationality:
 *                 type: string
 *                 nullable: true
 *                 description: Author's nationality (empty string sets to null)
 *     responses:
 *       200:
 *         description: Updated author
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Author'
 *       400:
 *         description: Invalid input (e.g., empty name)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authorsController.updateAuthor);

/**
 * @openapi
 * /api/authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     description: Deletes an author only if they have no books or series. Also deletes the author folder including images.
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Cannot delete author with books or series attached
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Author not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authorsController.deleteAuthor);

export default router;
