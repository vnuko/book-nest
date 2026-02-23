import { Router } from 'express';
import { booksController } from '../controllers/booksController.js';

const router = Router();

/**
 * @openapi
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookListResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', booksController.getBooks);

/**
 * @openapi
 * /api/books/search:
 *   get:
 *     summary: Search books
 *     tags: [Books]
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
 *               $ref: '#/components/schemas/BookListResponse'
 */
router.get('/search', booksController.searchBooks);

/**
 * @openapi
 * /api/books/author/{authorId}:
 *   get:
 *     summary: Get books by author
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Author ID
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
router.get('/author/:authorId', booksController.getBooksByAuthor);

/**
 * @openapi
 * /api/books/series/{seriesId}:
 *   get:
 *     summary: Get books by series
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: seriesId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Series ID
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
router.get('/series/:seriesId', booksController.getBooksBySeries);

/**
 * @openapi
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', booksController.getBookById);

/**
 * @openapi
 * /api/books/{id}/files:
 *   get:
 *     summary: Get files for a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Book ID
 *     responses:
 *       200:
 *         description: List of book files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BookFile'
 */
router.get('/:id/files', booksController.getBookFiles);

export default router;
