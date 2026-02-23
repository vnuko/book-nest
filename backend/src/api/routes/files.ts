import { Router } from 'express';
import { filesController } from '../controllers/filesController.js';

const router = Router();

/**
 * @openapi
 * /api/files/books/{bookId}/download/{format}:
 *   get:
 *     summary: Download a book file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Book ID
 *       - in: path
 *         name: format
 *         schema:
 *           type: string
 *           enum: [EPUB, PDF, MOBI, AZW3]
 *         required: true
 *         description: File format
 *     responses:
 *       200:
 *         description: Book file
 *         content:
 *           application/epub+zip:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/x-mobipocket-ebook:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 */
router.get('/books/:bookId/download/:format', filesController.downloadBookFile);

/**
 * @openapi
 * /api/files/images/authors/{authorId}:
 *   get:
 *     summary: Get author image
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Author image
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 */
router.get('/images/authors/:authorId', filesController.getAuthorImage);

/**
 * @openapi
 * /api/files/images/books/{bookId}:
 *   get:
 *     summary: Get book cover image
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Book cover image
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 */
router.get('/images/books/:bookId', filesController.getBookImage);

export default router;
