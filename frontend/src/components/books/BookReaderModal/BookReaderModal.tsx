import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { API_BASE } from '../../../api/client';
import styles from './BookReaderModal.module.css';

interface BookReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
}

const CHARS_PER_PAGE = 4000;

export function BookReaderModal({ isOpen, onClose, bookId, bookTitle }: BookReaderModalProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && bookId) {
      fetchBookContent();
      setCurrentPage(0);
    }
  }, [isOpen, bookId]);

  useEffect(() => {
    if (content) {
      setPages(paginateText(content));
    }
  }, [content]);

  const fetchBookContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/files/books/${bookId}/download/txt`);
      if (!response.ok) {
        throw new Error('Failed to load book content');
      }
      const text = await response.text();
      setContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book');
    } finally {
      setIsLoading(false);
    }
  };

  function paginateText(text: string): string[] {
    const pageList: string[] = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > CHARS_PER_PAGE && currentChunk.length > 0) {
        pageList.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += '\n\n' + paragraph;
      }
    }

    if (currentChunk.trim()) {
      pageList.push(currentChunk.trim());
    }

    return pageList;
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        setCurrentPage((p) => p - 1);
      } else if (e.key === 'ArrowRight' && currentPage < pages.length - 1) {
        setCurrentPage((p) => p + 1);
      }
    },
    [onClose, currentPage, pages.length]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((p) => p + 1);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="reader-title">
      <div className={styles.reader}>
        <div className={styles.header}>
          <h2 id="reader-title" className={styles.title}>{bookTitle}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close reader">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.content}>
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading book...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={fetchBookContent} className={styles.retryBtn}>
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && pages.length > 0 && (
            <div className={styles.pageContainer}>
              <div className={styles.pageContent}>
                {pages[currentPage].split('\n').map((paragraph, idx) => (
                  paragraph.trim() ? <p key={idx} className={styles.paragraph}>{paragraph}</p> : null
                ))}
              </div>
            </div>
          )}

          {!isLoading && !error && pages.length === 0 && (
            <div className={styles.empty}>
              <p>No content available</p>
            </div>
          )}
        </div>

        {!isLoading && !error && pages.length > 0 && (
          <div className={styles.footer}>
            <button
              className={styles.navBtn}
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div className={styles.pageInfo}>
              <span className={styles.pageNumber}>Page {currentPage + 1}</span>
              <span className={styles.pageDivider}>of</span>
              <span className={styles.totalPages}>{pages.length}</span>
            </div>

            <button
              className={styles.navBtn}
              onClick={goToNextPage}
              disabled={currentPage === pages.length - 1}
              aria-label="Next page"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
