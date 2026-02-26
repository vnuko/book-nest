import { useAuthors, useBooks, useSeries } from '../../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrip } from '@fortawesome/free-solid-svg-icons';
import { LoadingSpinner } from '../../components/common';
import { AuthorCard, BookCard, SeriesCard } from '../../components/cards';
import { ROUTES } from '../../utils/routes';
import { useNavigate } from 'react-router-dom';
import styles from './OverviewPage.module.css';

export function OverviewPage() {
  const navigate = useNavigate();
  const { data: authorsData, isLoading: isLoadingAuthors } = useAuthors(1, 10);
  const { data: booksData, isLoading: isLoadingBooks } = useBooks(1, 12);
  const { data: seriesData, isLoading: isLoadingSeries } = useSeries(1, 6);

  const isLoading = isLoadingAuthors || isLoadingBooks || isLoadingSeries;

  if (isLoading) {
    return (
      <div className="page-content">
        <LoadingSpinner />
      </div>
    );
  }

  const authors = authorsData?.data || [];
  const books = booksData?.data || [];
  const series = seriesData?.data || [];

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
            {books.slice(0, 6).map((book) => (
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
            {authors.slice(0, 6).map((author) => (
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
            {books.slice(6, 12).map((book) => (
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
            {series.map((s) => (
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
