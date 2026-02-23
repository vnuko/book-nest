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
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
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
