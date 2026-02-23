import { useNavigate } from 'react-router-dom';
import styles from './BackLink.module.css';

interface BackLinkProps {
  to: string;
  label: string;
}

export function BackLink({ to, label }: BackLinkProps) {
  const navigate = useNavigate();

  return (
    <button className={styles.backLink} onClick={() => navigate(to)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m15 18-6-6 6-6" />
      </svg>
      {label}
    </button>
  );
}
