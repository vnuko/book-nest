import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPen, faLink, faTrash, faBookOpen, faImage, faCamera } from '@fortawesome/free-solid-svg-icons';
import { useBook, useUpdateBook } from '../../hooks';
import { LoadingSpinner, ConfirmDialog } from '../../components/common';
import { BackLink } from '../../components/common/BackLink';
import { ROUTES } from '../../utils/routes';
import { getImageUrl, API_BASE } from '../../api/client';
import { RelinkBookModal, BookReaderModal, BookImageModal } from '../../components/books';
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
    <a href={downloadUrl} className={styles.downloadBtn} download>
      <span className={`${styles.fileBadge} ${getBadgeClass(file.format)}`}>
        {file.format}
      </span>
      {file.size && <span>{formatFileSize(file.size)}</span>}
      <FontAwesomeIcon icon={faDownload} />
    </a>
  );
}

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useBook(id);
  const { mutate: updateBook, isPending: isSaving, error: updateError } = useUpdateBook(id!);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedYear, setEditedYear] = useState<number | null>(null);
  const [isRelinkModalOpen, setIsRelinkModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const handleStartEdit = () => {
    if (data?.data) {
      setEditedTitle(data.data.title);
      setEditedDescription(data.data.description || '');
      setEditedYear(data.data.firstPublishYear);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateBook({
      title: editedTitle,
      description: editedDescription || null,
      firstPublishYear: editedYear,
    }, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log('Deleting book:', id);
    setIsDeleteDialogOpen(false);
  };

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
  const hasTxtFile = book.files?.some(f => f.format.toLowerCase() === 'txt');

  return (
    <div className="page-content">
      <div className={styles.topBar}>
        <BackLink to={ROUTES.BOOKS} label="Back to Books" />
        {!isEditing && (
          <div className={styles.actions}>
            {hasTxtFile && (
              <button 
                className={`${styles.actionBtn} ${styles.readBtn}`}
                onClick={() => setIsReaderOpen(true)}
                aria-label="Read book"
                title="Read book in browser"
              >
                <FontAwesomeIcon icon={faBookOpen} />
              </button>
            )}
            <button 
              className={styles.actionBtn} 
              onClick={handleStartEdit}
              aria-label="Edit book"
              title="Edit book details"
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button 
              className={styles.actionBtn} 
              onClick={() => setIsRelinkModalOpen(true)}
              aria-label="Relink book"
              title="Link to different author/series"
            >
              <FontAwesomeIcon icon={faLink} />
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.imageBtn}`} 
              onClick={() => setIsImageModalOpen(true)}
              aria-label="Change cover image"
              title="Change book cover image"
            >
              <FontAwesomeIcon icon={faImage} />
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.dangerBtn}`} 
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label="Delete book"
              title="Delete book"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.header}>
        <div 
          className={styles.coverWrapper}
          onClick={() => setIsImageModalOpen(true)}
        >
          <img 
            src={`${coverUrl}?v=${imageKey}`} 
            alt={book.title} 
            className={styles.coverLarge} 
          />
          <div className={styles.coverOverlay}>
            <FontAwesomeIcon icon={faCamera} className={styles.overlayIcon} />
          </div>
        </div>
        <div className={styles.info}>
          {isEditing ? (
            <>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Title</label>
                <input
                  type="text"
                  className={styles.editInput}
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Description</label>
                <textarea
                  className={styles.editTextarea}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>First Publish Year</label>
                <input
                  type="number"
                  className={styles.editInput}
                  value={editedYear ?? ''}
                  onChange={(e) => setEditedYear(e.target.value ? parseInt(e.target.value) : null)}
                />
              </div>
              <div className={styles.editActions}>
                <button className={styles.cancelEditBtn} onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </button>
                <button className={styles.saveEditBtn} onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                {updateError && (
                  <p className={styles.editError}>Failed to save changes. Please try again.</p>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className={styles.title}>{book.title}</h1>
              <p className={styles.meta}>by <Link to={ROUTES.AUTHOR_DETAIL(book.author.id)} className={styles.authorLink}>{book.author.name}</Link></p>
              {book.series && (
                <Link to={ROUTES.SERIES_DETAIL(book.series.id)} className={styles.seriesLink}>
                  Part of: {book.series.name}
                  {book.seriesOrder && ` (Book ${book.seriesOrder})`}
                </Link>
              )}
              {book.description && <p className={styles.description}>{book.description}</p>}
              {book.firstPublishYear && (
                <p className={styles.publishYear}>First published: {book.firstPublishYear}</p>
              )}
            </>
          )}
          
          {!isEditing && book.files && book.files.length > 0 && (
            <div className={styles.downloadSection}>
              <h3 className={styles.downloadTitle}>
                <FontAwesomeIcon icon={faDownload} />
                {' '}Download Files
              </h3>
              <div className={styles.downloadList}>
                {book.files.map((file) => (
                  <DownloadButton key={file.id} file={file} bookId={book.id} />
                ))}
              </div>
            </div>
          )}

          {!isEditing && hasTxtFile && (
            <div className={styles.readSection}>
              <button 
                className={styles.readNowBtn}
                onClick={() => setIsReaderOpen(true)}
              >
                <FontAwesomeIcon icon={faBookOpen} />
                <span>Read Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <RelinkBookModal
        isOpen={isRelinkModalOpen}
        onClose={() => setIsRelinkModalOpen(false)}
        bookId={book.id}
        currentAuthor={book.author}
        currentSeries={book.series}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <BookReaderModal
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        bookId={book.id}
        bookTitle={book.title}
      />

      <BookImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        bookId={book.id}
        onImageUpdated={() => setImageKey((k) => k + 1)}
      />
    </div>
  );
}
