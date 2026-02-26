import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { ROUTES } from '../../../utils/routes';
import { getImageUrl } from '../../../api/client';
import { LikeButton } from '../../common';
import { useToggleBookLike } from '../../../hooks';
import type { Book } from '../../../types';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(book.liked);
  const { toggle } = useToggleBookLike(book.id);

  const handleClick = () => {
    navigate(ROUTES.BOOK_DETAIL(book.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleLikeToggle = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    toggle(newLiked);
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
            <FontAwesomeIcon icon={faBookOpen} />
          </button>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.authorName}>{book.author.name}</p>
        <div className={styles.meta}>
          <span className={styles.year}>{book.firstPublishYear}</span>
          <LikeButton
            isLiked={isLiked}
            onToggle={handleLikeToggle}
          />
        </div>
      </div>
    </div>
  );
}
