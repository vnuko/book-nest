import { Router } from 'express';
import { filesController } from '../controllers/filesController.js';
import { uploadMiddleware } from '../middleware/upload.js';

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

/**
 * @openapi
 * /api/files/images/series/{seriesId}:
 *   get:
 *     summary: Get series image
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: seriesId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Series image
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/images/series/:seriesId', filesController.getSeriesImage);

/**
 * @openapi
 * /api/files/images/authors/{authorId}:
 *   put:
 *     summary: Upload author image
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, or WebP, max 2MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid file or missing file
 *       404:
 *         description: Author not found
 */
router.put('/images/authors/:authorId', uploadMiddleware.single('file'), filesController.uploadAuthorImage);

/**
 * @openapi
 * /api/files/images/books/{bookId}:
 *   put:
 *     summary: Upload book cover image
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, or WebP, max 2MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid file or missing file
 *       404:
 *         description: Book not found
 */
router.put('/images/books/:bookId', uploadMiddleware.single('file'), filesController.uploadBookImage);

/**
 * @openapi
 * /api/files/images/series/{seriesId}:
 *   put:
 *     summary: Upload series image
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: seriesId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, or WebP, max 2MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid file or missing file
 *       404:
 *         description: Series not found
 */
router.put('/images/series/:seriesId', uploadMiddleware.single('file'), filesController.uploadSeriesImage);

export default router;
