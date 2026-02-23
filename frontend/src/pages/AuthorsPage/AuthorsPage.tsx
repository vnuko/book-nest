import { useState } from 'react';
import { useAuthors, useAuthorSearch } from '../../hooks';
import { LoadingSpinner, SearchBar, ErrorMessage } from '../../components/common';
import { AuthorCard } from '../../components/cards';
import styles from './AuthorsPage.module.css';

export function AuthorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = searchQuery.trim();

  const {
    data: allAuthors,
    isLoading: isLoadingAll,
    error: allError,
    refetch: refetchAll,
  } = useAuthors(1, 100);

  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useAuthorSearch(debouncedQuery, 1, 100);

  const isLoading = searchQuery ? isSearching : isLoadingAll;
  const error = searchQuery ? searchError : allError;
  const authors = searchQuery ? searchResults?.data : allAuthors?.data;

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
        <h1 className="page-title">Authors</h1>
        <SearchBar placeholder="Search authors..." onChange={setSearchQuery} />
        <ErrorMessage
          message="Failed to load authors. Please try again."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Authors</h1>
      <SearchBar placeholder="Search authors..." onChange={setSearchQuery} />
      {isLoading ? (
        <LoadingSpinner />
      ) : authors && authors.length > 0 ? (
        <div className={styles.grid}>
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} large />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p>{searchQuery ? 'No authors found matching your search' : 'No authors available'}</p>
        </div>
      )}
    </div>
  );
}
