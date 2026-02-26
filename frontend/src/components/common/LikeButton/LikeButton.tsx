import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
  isLiked: boolean;
  onToggle: () => void;
}

export function LikeButton({ isLiked, onToggle }: LikeButtonProps) {
  return (
    <button
      className={styles.button}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <FontAwesomeIcon
        icon={isLiked ? faHeart : farHeart}
        className={`${styles.icon} ${isLiked ? styles.liked : ''}`}
      />
    </button>
  );
}
