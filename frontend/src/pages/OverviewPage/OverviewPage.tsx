import { useAuthors, useBooks, useSeries } from '../../hooks';
import { LoadingSpinner } from '../../components/common';
import { HorizontalScroll } from '../../components/sections';
import { AuthorCard, BookCard, SeriesCard } from '../../components/cards';
import { ROUTES } from '../../utils/routes';
import styles from './OverviewPage.module.css';

export function OverviewPage() {
  const { data: authorsData, isLoading: isLoadingAuthors } = useAuthors(1, 10);
  const { data: booksData, isLoading: isLoadingBooks } = useBooks(1, 10);
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
      <HorizontalScroll
        title="Popular Authors"
        items={authors}
        itemWidth="author"
        seeMorePath={ROUTES.AUTHORS}
        renderItem={(author) => <AuthorCard author={author} />}
      />

      <HorizontalScroll
        title="Trending Books"
        items={books}
        itemWidth="book"
        seeMorePath={ROUTES.BOOKS}
        renderItem={(book) => <BookCard book={book} />}
      />

      <HorizontalScroll
        title="Featured Series"
        items={series}
        itemWidth="series"
        seeMorePath={ROUTES.SERIES}
        renderItem={(s) => <SeriesCard series={s} />}
      />

      {authors.length === 0 && books.length === 0 && series.length === 0 && (
        <div className={styles.emptyState}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <p>Your library is empty. Start by indexing some books!</p>
        </div>
      )}
    </div>
  );
}
