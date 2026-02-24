import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { useBooks, useBookSearch } from '../../hooks';
import { LoadingSpinner, SearchBar, ErrorMessage } from '../../components/common';
import { BookCard } from '../../components/cards';
import styles from './BooksPage.module.css';

export function BooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = searchQuery.trim();

  const {
    data: allBooks,
    isLoading: isLoadingAll,
    error: allError,
    refetch: refetchAll,
  } = useBooks(1, 100);

  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
    refetch: refetchSearch,
  } = useBookSearch(debouncedQuery, 1, 100);

  const isLoading = searchQuery ? isSearching : isLoadingAll;
  const error = searchQuery ? searchError : allError;
  const books = searchQuery ? searchResults?.data : allBooks?.data;

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
        <h1 className="page-title">Books</h1>
        <SearchBar placeholder="Search books..." onChange={setSearchQuery} />
        <ErrorMessage
          message="Failed to load books. Please try again."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Books</h1>
      <SearchBar placeholder="Search books..." onChange={setSearchQuery} />
      {isLoading ? (
        <LoadingSpinner />
      ) : books && books.length > 0 ? (
        <div className="bn-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faBook} className={styles.emptyIcon} />
          <p>{searchQuery ? 'No books found matching your search' : 'No books available'}</p>
        </div>
      )}
    </div>
  );
}
