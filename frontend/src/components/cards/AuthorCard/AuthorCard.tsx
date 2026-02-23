import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routes';
import type { Author } from '../../../types';
import styles from './AuthorCard.module.css';

interface AuthorCardProps {
  author: Author;
  large?: boolean;
}

export function AuthorCard({ author, large = false }: AuthorCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.AUTHOR_DETAIL(author.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const imageUrl = `/api/files/images/authors/${author.id}`;

  return (
    <div
      className={`${styles.card} ${large ? styles.cardLarge : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${author.name}`}
    >
      <div className={styles.avatarWrapper}>
        <img
          src={imageUrl}
          alt={author.name}
          className={styles.avatar}
          loading="lazy"
        />
      </div>
      <span className={styles.name}>{author.name}</span>
    </div>
  );
}
