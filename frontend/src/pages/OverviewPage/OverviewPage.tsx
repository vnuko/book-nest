import { useOverview } from '../../hooks';
import type { Book, Author, Series as SeriesType } from '../../types';

interface OverviewAuthor {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  bookCount: number;
}

interface OverviewBookFile {
  id: string;
  format: string;
  size: number;
}

interface OverviewBook {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  seriesId: string | null;
  seriesName: string | null;
  description: string | null;
  coverUrl: string;
  files: OverviewBookFile[];
}

interface OverviewSeries {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  bookCount: number;
}

interface OverviewResponse {
  popularAuthors: OverviewAuthor[];
  trendingBooks: OverviewBook[];
  featuredSeries: OverviewSeries[];
}
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrip } from '@fortawesome/free-solid-svg-icons';
import { LoadingSpinner } from '../../components/common';
import { AuthorCard, BookCard, SeriesCard } from '../../components/cards';
import { ROUTES } from '../../utils/routes';
import { useNavigate } from 'react-router-dom';
import styles from './OverviewPage.module.css';

export function OverviewPage() {
  const navigate = useNavigate();
  const { data: overviewData, isLoading } = useOverview();

  if (isLoading) {
    return (
      <div className="page-content">
        <LoadingSpinner />
      </div>
    );
  }

  // Backend returns { popularAuthors, trendingBooks, featuredSeries }
  // Frontend types may also expect { data: { recentBooks, recentAuthors } }
  const od = overviewData as OverviewResponse | undefined;
  const rawAuthors = od?.popularAuthors ?? [];
  const rawBooks = od?.trendingBooks ?? [];
  const rawSeries = od?.featuredSeries ?? [];

  const authors: Author[] = rawAuthors.map((author) => ({
    id: author.id,
    name: author.name,
    slug: author.name,
    bio: author.bio,
    nationality: null,
    dateOfBirth: null,
    bookCount: author.bookCount,
    createdAt: '',
    updatedAt: '',
  }));

  const books: Book[] = rawBooks.map((book) => ({
    id: book.id,
    title: book.title,
    originalTitle: null,
    slug: book.title,
    description: book.description,
    isbn: null,
    firstPublishYear: null,
    author: {
      id: book.authorId,
      name: book.authorName,
      slug: book.authorName,
    },
    series: book.seriesId
      ? {
          id: book.seriesId,
          name: book.seriesName || 'Unknown',
          slug: book.seriesName || 'unknown',
        }
      : null,
    seriesOrder: null,
    files: book.files.map((f) => ({
      id: f.id,
      format: f.format,
      size: f.size,
    })),
    createdAt: '',
    updatedAt: '',
    liked: false,
  }));

  const series: SeriesType[] = rawSeries.map((s) => ({
    id: s.id,
    name: s.name,
    originalName: null,
    slug: s.name,
    description: s.description,
    author: {
      id: '',
      name: '',
      slug: '',
    },
    bookCount: s.bookCount,
    createdAt: '',
    updatedAt: '',
  }));

  return (
    <div className="page-content">
      {books.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeadingRow}>
            <h2 className={styles.sectionHeading}>Trending Now</h2>
            <button className={styles.seeMore} onClick={() => navigate(ROUTES.BOOKS)}>
              See More
            </button>
          </div>
          <div className={`row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 row-cols-xxl-6 g-4`}>
            {books.slice(0, 6).map((book: Book) => (
              <div key={book.id} className="col">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </section>
      )}

      {authors.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeadingRow}>
            <h2 className={styles.sectionHeading}>Featured Authors</h2>
            <button className={styles.seeMore} onClick={() => navigate(ROUTES.AUTHORS)}>
              See More
            </button>
          </div>
          <div className={`row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6 g-4`}>
            {authors.slice(0, 6).map((author: Author) => (
              <div key={author.id} className="col">
                <AuthorCard author={author} />
              </div>
            ))}
          </div>
        </section>
      )}

      {books.length > 6 && (
        <section className={styles.section}>
          <div className={styles.sectionHeadingRow}>
            <h2 className={styles.sectionHeading}>Recently Added</h2>
          </div>
          <div className={`row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 row-cols-xxl-6 g-4`}>
            {books.slice(6, 12).map((book: Book) => (
              <div key={book.id} className="col">
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </section>
      )}

      {series.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeadingRow}>
            <h2 className={styles.sectionHeading}>Featured Series</h2>
            <button className={styles.seeMore} onClick={() => navigate(ROUTES.SERIES)}>
              See More
            </button>
          </div>
          <div className={`row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 row-cols-xxl-6 g-4`}>
            {series.map((s: SeriesType) => (
              <div key={s.id} className="col">
                <SeriesCard series={s} />
              </div>
            ))}
          </div>
        </section>
      )}

      {authors.length === 0 && books.length === 0 && series.length === 0 && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faGrip} className={styles.emptyIcon} />
          <p>Your library is empty. Start by indexing some books!</p>
        </div>
      )}
    </div>
  );
}
