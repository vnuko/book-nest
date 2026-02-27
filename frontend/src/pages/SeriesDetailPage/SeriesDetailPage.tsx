import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faLink, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSeriesById, useSeriesBooks, useUpdateSeries } from '../../hooks';
import { LoadingSpinner, ConfirmDialog } from '../../components/common';
import { BackLink } from '../../components/common/BackLink';
import { BookCard } from '../../components/cards';
import { RelinkSeriesModal } from '../../components/series';
import { ROUTES } from '../../utils/routes';
import { getImageUrl } from '../../api/client';
import styles from './SeriesDetailPage.module.css';

export function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: seriesData, isLoading: isLoadingSeries, error: seriesError } = useSeriesById(id);
  const { data: booksData, isLoading: isLoadingBooks } = useSeriesBooks(id, 1, 50);
  const { mutate: updateSeries, isPending: isSaving, error: updateError } = useUpdateSeries(id!);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isRelinkModalOpen, setIsRelinkModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isLoading = isLoadingSeries || isLoadingBooks;

  const handleStartEdit = () => {
    if (seriesData?.data) {
      setEditedTitle(seriesData.data.name);
      setEditedDescription(seriesData.data.description || '');
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateSeries(
      { name: editedTitle, description: editedDescription || null },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log('Deleting series:', id);
    setIsDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="page-content">
        <LoadingSpinner />
      </div>
    );
  }

  if (seriesError || !seriesData?.data) {
    return (
      <div className="page-content">
        <BackLink to={ROUTES.SERIES} label="Back to Series" />
        <div className={styles.error}>
          <p>Series not found</p>
        </div>
      </div>
    );
  }

  const series = seriesData.data;
  const books = booksData?.data || [];

  const bannerUrl = books.length > 0
    ? getImageUrl('books', books[0].id)
    : '/placeholder-series.jpg';

  return (
    <>
      <div className={styles.heroBanner} style={{ backgroundImage: `url(${bannerUrl})` }}>
        <div className={styles.heroGradient}>
          <div className={styles.backLink}>
            <BackLink to={ROUTES.SERIES} label="Back to Series" />
          </div>
          <div className={styles.heroContent}>
            {!isEditing && (
              <div className={styles.heroActions}>
                <button
                  className={styles.heroActionBtn}
                  onClick={handleStartEdit}
                  aria-label="Edit series"
                  title="Edit series details"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button
                  className={styles.heroActionBtn}
                  onClick={() => setIsRelinkModalOpen(true)}
                  aria-label="Relink series"
                  title="Link to different author"
                >
                  <FontAwesomeIcon icon={faLink} />
                </button>
                <button
                  className={`${styles.heroActionBtn} ${styles.dangerBtn}`}
                  onClick={() => setIsDeleteDialogOpen(true)}
                  aria-label="Delete series"
                  title="Delete series"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            )}
            {isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.editField}>
                  <label className={styles.editLabel}>Series Title</label>
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
                    rows={3}
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
              </div>
            ) : (
              <>
                <h1 className={styles.title}>{series.name}</h1>
                {series.description && (
                  <p className={styles.description}>{series.description}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="page-content">

      {books.length > 0 && (
        <div className={styles.booksSection}>
          <h3 className="section-title">Books in this Series</h3>
          <div className="bn-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

      <RelinkSeriesModal
        isOpen={isRelinkModalOpen}
        onClose={() => setIsRelinkModalOpen(false)}
        seriesId={series.id}
        currentAuthor={series.author || null}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Series"
        message={`Are you sure you want to delete "${series.name}"? This will remove the series but keep all books. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
      </div>
    </>
  );
}
