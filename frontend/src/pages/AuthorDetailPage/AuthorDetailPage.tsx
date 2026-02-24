import { useParams } from 'react-router-dom';
import { useAuthor, useBooksByAuthor } from '../../hooks';
import { LoadingSpinner } from '../../components/common';
import { BackLink } from '../../components/common/BackLink';
import { BookCard } from '../../components/cards';
import { ROUTES } from '../../utils/routes';
import { getImageUrl } from '../../api/client';
import styles from './AuthorDetailPage.module.css';

export function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: authorData, isLoading: isLoadingAuthor, error: authorError } = useAuthor(id);
  const { data: booksData, isLoading: isLoadingBooks } = useBooksByAuthor(id, 1, 50);

  const isLoading = isLoadingAuthor || isLoadingBooks;

  if (isLoading) {
    return (
      <div className="page-content">
        <LoadingSpinner />
      </div>
    );
  }

  if (authorError || !authorData?.data) {
    return (
      <div className="page-content">
        <BackLink to={ROUTES.AUTHORS} label="Back to Authors" />
        <div className={styles.error}>
          <p>Author not found</p>
        </div>
      </div>
    );
  }

  const author = authorData.data;
  const books = booksData?.data || [];
  const avatarUrl = getImageUrl('authors', author.id);

  return (
    <div className="page-content">
      <BackLink to={ROUTES.AUTHORS} label="Back to Authors" />

      <div className={styles.header}>
        <img
          src={avatarUrl}
          alt={author.name}
          className={styles.avatarLarge}
        />
        <div className={styles.info}>
          <h1 className={styles.title}>{author.name}</h1>
          {author.bio && (
            <p className={styles.description}>{author.bio}</p>
          )}
        </div>
      </div>

      {books.length > 0 && (
        <div className={styles.booksSection}>
          <h3 className="section-title">Books by this Author</h3>
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
