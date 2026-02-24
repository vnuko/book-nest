import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message = 'An error occurred while loading data.',
  onRetry,
  retryText = 'Try Again',
}: ErrorMessageProps) {
  return (
    <div className={styles.container}>
      <FontAwesomeIcon icon={faCircleExclamation} className={styles.icon} />
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          {retryText}
        </button>
      )}
    </div>
  );
}
