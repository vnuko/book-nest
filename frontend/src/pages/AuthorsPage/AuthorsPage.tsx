import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
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
          <FontAwesomeIcon icon={faUsers} className={styles.emptyIcon} />
          <p>{searchQuery ? 'No authors found matching your search' : 'No authors available'}</p>
        </div>
      )}
    </div>
  );
}
