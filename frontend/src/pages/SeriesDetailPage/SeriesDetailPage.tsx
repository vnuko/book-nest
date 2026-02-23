import { useParams } from 'react-router-dom';
import { useSeriesById, useSeriesBooks } from '../../hooks';
import { LoadingSpinner } from '../../components/common';
import { BackLink } from '../../components/common/BackLink';
import { BookCard } from '../../components/cards';
import { ROUTES } from '../../utils/routes';
import styles from './SeriesDetailPage.module.css';

export function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: seriesData, isLoading: isLoadingSeries, error: seriesError } = useSeriesById(id);
  const { data: booksData, isLoading: isLoadingBooks } = useSeriesBooks(id, 1, 50);

  const isLoading = isLoadingSeries || isLoadingBooks;

  if (isLoading) {
    return (
      <div className="page-content">
        <LoadingSpinner />
      </div>
    );
  }

  if (seriesError || !seriesData?.data) {
    return (
      <div className="page-content">
        <BackLink to={ROUTES.SERIES} label="Back to Series" />
        <div className={styles.error}>
          <p>Series not found</p>
        </div>
      </div>
    );
  }

  const series = seriesData.data;
  const books = booksData?.data || [];

  const bannerUrl = books.length > 0
    ? `/api/files/images/books/${books[0].id}`
    : '/placeholder-series.jpg';

  return (
    <div className="page-content">
      <BackLink to={ROUTES.SERIES} label="Back to Series" />

      <div className={styles.banner}>
        <img
          src={bannerUrl}
          alt={series.name}
          className={styles.bannerImg}
        />
        <div className={styles.bannerOverlay}>
          <h1 className={styles.title}>{series.name}</h1>
          {series.description && (
            <p className={styles.description}>{series.description}</p>
          )}
        </div>
      </div>

      {books.length > 0 && (
        <div className={styles.booksSection}>
          <h3 className="section-title">Books in this Series</h3>
          <div className="bn-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
