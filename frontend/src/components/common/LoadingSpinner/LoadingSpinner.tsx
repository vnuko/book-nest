import styles from './LoadingSpinner.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export function LoadingSpinner() {
  return (
    <div className={styles.spinner}>
      <FontAwesomeIcon icon={faSpinner} spin />
    </div>
  );
}
