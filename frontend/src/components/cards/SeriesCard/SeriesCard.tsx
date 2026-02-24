import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/routes';
import { getImageUrl } from '../../../api/client';
import type { Series } from '../../../types';
import styles from './SeriesCard.module.css';

interface SeriesCardProps {
  series: Series;
}

export function SeriesCard({ series }: SeriesCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.SERIES_DETAIL(series.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const imageUrl = getImageUrl('series', series.id);

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${series.name}`}
    >
      <div className={styles.coverWrapper}>
        <img
          src={imageUrl}
          alt={series.name}
          className={styles.cover}
          loading="lazy"
        />
        <div className={styles.overlay}>
          <button className={styles.collectionButton} type="button" aria-label="View series">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{series.name}</h3>
        <p className={styles.count}>
          {series.bookCount} book{series.bookCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
