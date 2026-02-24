import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
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
            <FontAwesomeIcon icon={faPlus} />
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
