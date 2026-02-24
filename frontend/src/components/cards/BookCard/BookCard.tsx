import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routes';
import { getImageUrl } from '../../../api/client';
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

  const imageUrl = getImageUrl('books', book.id);

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${book.title}`}
    >
      <div className={styles.coverWrapper}>
        <img
          src={imageUrl}
          alt={book.title}
          className={styles.cover}
          loading="lazy"
        />
        <div className={styles.overlay}>
          <button className={styles.playButton} type="button" aria-label="View book">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.authorName}>{book.author.name}</p>
      </div>
    </div>
  );
}
