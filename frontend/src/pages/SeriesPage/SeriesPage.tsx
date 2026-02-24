import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { useSeries, useSeriesSearch } from '../../hooks';
import { LoadingSpinner, SearchBar, ErrorMessage } from '../../components/common';
import { SeriesCard } from '../../components/cards';
import styles from './SeriesPage.module.css';

export function SeriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = searchQuery.trim();

  const {
    data: allSeries,
    isLoading: isLoadingAll,
    error: allError,
    refetch: refetchAll,
  } = useSeries(1, 100);

  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useSeriesSearch(debouncedQuery, 1, 100);

  const isLoading = searchQuery ? isSearching : isLoadingAll;
  const error = searchQuery ? searchError : allError;
  const series = searchQuery ? searchResults?.data : allSeries?.data;

  const handleRetry = () => {
    if (searchQuery) {
      refetchSearch();
    } else {
      refetchAll();
    }
  };

  if (error) {
    return (
      <div className="page-content">
        <h1 className="page-title">Series</h1>
        <SearchBar placeholder="Search series..." onChange={setSearchQuery} />
        <ErrorMessage
          message="Failed to load series. Please try again."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Series</h1>
      <SearchBar placeholder="Search series..." onChange={setSearchQuery} />
      {isLoading ? (
        <LoadingSpinner />
      ) : series && series.length > 0 ? (
        <div className="bn-grid bn-grid-series">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faLayerGroup} className={styles.emptyIcon} />
          <p>{searchQuery ? 'No series found matching your search' : 'No series available'}</p>
        </div>
      )}
    </div>
  );
}
