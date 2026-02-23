import { Router } from 'express';
import booksRoutes from './books.js';
import authorsRoutes from './authors.js';
import seriesRoutes from './series.js';
import filesRoutes from './files.js';
import indexingRoutes from './indexing.js';
import overviewRoutes from './overview.js';
import searchRoutes from './search.js';

const router = Router();

router.use('/books', booksRoutes);
router.use('/authors', authorsRoutes);
router.use('/series', seriesRoutes);
router.use('/files', filesRoutes);
router.use('/indexing', indexingRoutes);
router.use('/overview', overviewRoutes);
router.use('/search', searchRoutes);

export default router;
