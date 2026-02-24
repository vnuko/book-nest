import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Sidebar } from '../Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <button
        className={styles.mobileMenuBtn}
        onClick={toggleSidebar}
        aria-label="Open menu"
        type="button"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main id="main-content" className={styles.main}>
        {children}
      </main>
    </>
  );
}
