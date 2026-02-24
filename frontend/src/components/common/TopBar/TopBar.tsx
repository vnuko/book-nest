import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faMagnifyingGlass, faGear, faBars } from '@fortawesome/free-solid-svg-icons';
import styles from './TopBar.module.css';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <div className={styles.logo}>
        <FontAwesomeIcon icon={faBook} className={styles.logoIcon} />
        <span className={styles.logoText}>BookNest</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
        <button className={styles.iconBtn} aria-label="Settings">
          <FontAwesomeIcon icon={faGear} />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.hamburger}`}
          aria-label="Menu"
          onClick={onMenuClick}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
    </header>
  );
}
