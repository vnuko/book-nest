import { useState } from 'react';
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <p>{searchQuery ? 'No books found matching your search' : 'No books available'}</p>
        </div>
      )}
    </div>
  );
}
