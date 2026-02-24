import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import styles from './BackLink.module.css';

interface BackLinkProps {
  to: string;
  label: string;
}

export function BackLink({ to, label }: BackLinkProps) {
  const navigate = useNavigate();

  return (
    <button className={styles.backLink} onClick={() => navigate(to)}>
      <FontAwesomeIcon icon={faChevronLeft} />
      {label}
    </button>
  );
}
