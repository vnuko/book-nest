import { useParams, Link } from 'react-router-dom';
import { useBook } from '../../hooks';
import { LoadingSpinner } from '../../components/common';
import { BackLink } from '../../components/common/BackLink';
import { ROUTES } from '../../utils/routes';
import { getImageUrl, API_BASE } from '../../api/client';
import type { BookFile } from '../../types';
import styles from './BookDetailPage.module.css';

function getBadgeClass(format: string): string {
  const formatMap: Record<string, string> = {
    epub: styles.fileBadgeEpub,
    mobi: styles.fileBadgeMobi,
    pdf: styles.fileBadgePdf,
    txt: styles.fileBadgeTxt,
    azw3: styles.fileBadgeAzw3,
    fb2: styles.fileBadgeFb2,
  };
  return formatMap[format.toLowerCase()] || '';
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function DownloadButton({ file, bookId }: { file: BookFile; bookId: string }) {
  const downloadUrl = `${API_BASE}/api/files/books/${bookId}/download/${file.format}`;

  return (
    <a
      href={downloadUrl}
      className={styles.downloadBtn}
      download
    >
      <span className={`${styles.fileBadge} ${getBadgeClass(file.format)}`}>
        {file.format}
      </span>
      {file.size && <span>{formatFileSize(file.size)}</span>}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </a>
  );
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useBook(id);

  if (isLoading) {
    return (
      <div className="page-content">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="page-content">
        <BackLink to={ROUTES.BOOKS} label="Back to Books" />
        <div className={styles.error}>
          <p>Book not found</p>
        </div>
      </div>
    );
  }

  const book = data.data;
  const coverUrl = getImageUrl('books', book.id);

  return (
    <div className="page-content">
      <BackLink to={ROUTES.BOOKS} label="Back to Books" />

      <div className={styles.header}>
        <img
          src={coverUrl}
          alt={book.title}
          className={styles.coverLarge}
        />
        <div className={styles.info}>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.meta}>by {book.author.name}</p>

          {book.series && (
            <Link to={ROUTES.SERIES_DETAIL(book.series.id)} className={styles.seriesLink}>
              Part of: {book.series.name}
              {book.seriesOrder && ` (Book ${book.seriesOrder})`}
            </Link>
          )}

          {book.description && (
            <p className={styles.description}>{book.description}</p>
          )}

          {book.files && book.files.length > 0 && (
            <div className={styles.downloadSection}>
              <h3 className={styles.downloadTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Files
              </h3>
              <div className={styles.downloadList}>
                {book.files.map((file) => (
                  <DownloadButton key={file.id} file={file} bookId={book.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
