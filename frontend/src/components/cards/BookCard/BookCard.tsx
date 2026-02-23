import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routes';
import type { Book } from '../../../types';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.BOOK_DETAIL(book.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const imageUrl = `/api/files/images/books/${book.id}`;

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${book.title}`}
    >
      <img
        src={imageUrl}
        alt={book.title}
        className={styles.cover}
        loading="lazy"
      />
      <h3 className={styles.title}>{book.title}</h3>
      <p className={styles.authorName}>{book.author.name}</p>
    </div>
  );
}
