import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faGlobe, faPen, faTrash, faImage, faCamera } from '@fortawesome/free-solid-svg-icons';
import { useAuthor, useBooksByAuthor, useUpdateAuthor } from '../../hooks';
import { LoadingSpinner, ConfirmDialog } from '../../components/common';
import { BackLink } from '../../components/common/BackLink';
import { BookCard } from '../../components/cards';
import { AuthorImageModal } from '../../components/authors';
import { ROUTES } from '../../utils/routes';
import { getImageUrl } from '../../api/client';
import styles from './AuthorDetailPage.module.css';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: authorData, isLoading: isLoadingAuthor, error: authorError } = useAuthor(id);
  const { data: booksData, isLoading: isLoadingBooks } = useBooksByAuthor(id, 1, 50);
  const updateAuthor = useUpdateAuthor(id || '');

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedDob, setEditedDob] = useState('');
  const [editedNationality, setEditedNationality] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const isLoading = isLoadingAuthor || isLoadingBooks;

  const handleStartEdit = () => {
    if (authorData?.data) {
      setEditedName(authorData.data.name);
      setEditedBio(authorData.data.bio || '');
      setEditedDob(authorData.data.dateOfBirth || '');
      setEditedNationality(authorData.data.nationality || '');
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateAuthor.mutate({
      name: editedName,
      bio: editedBio || null,
      dateOfBirth: editedDob || null,
      nationality: editedNationality || null,
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
    console.log('Deleting author:', id);
    setIsDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="page-content">
        <LoadingSpinner />
      </div>
    );
  }

  if (authorError || !authorData?.data) {
    return (
      <div className="page-content">
        <BackLink to={ROUTES.AUTHORS} label="Back to Authors" />
        <div className={styles.error}>
          <p>Author not found</p>
        </div>
      </div>
    );
  }

  const author = authorData.data;
  const books = booksData?.data || [];
  const avatarUrl = getImageUrl('authors', author.id);

  return (
    <div className="page-content">
      <div className={styles.topBar}>
        <BackLink to={ROUTES.AUTHORS} label="Back to Authors" />
        {!isEditing && (
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={handleStartEdit}
              aria-label="Edit author"
              title="Edit author details"
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.imageBtn}`}
              onClick={() => setIsImageModalOpen(true)}
              aria-label="Change author photo"
              title="Change author photo"
            >
              <FontAwesomeIcon icon={faImage} />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.dangerBtn}`}
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label="Delete author"
              title="Delete author"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.header}>
        <div 
          className={styles.avatarWrapper}
          onClick={() => setIsImageModalOpen(true)}
        >
          <img
            src={`${avatarUrl}?v=${imageKey}`}
            alt={author.name}
            className={styles.avatarLarge}
          />
          <div className={styles.avatarOverlay}>
            <FontAwesomeIcon icon={faCamera} className={styles.overlayIcon} />
          </div>
        </div>
        <div className={styles.info}>
          {isEditing ? (
            <>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Author Name</label>
                <input
                  type="text"
                  className={styles.editInput}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Biography</label>
                <textarea
                  className={styles.editTextarea}
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  rows={4}
                />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Date of Birth</label>
                <input
                  type="text"
                  className={styles.editInput}
                  value={editedDob}
                  onChange={(e) => setEditedDob(e.target.value)}
                  placeholder="Select date"
                />
              </div>
              <div className={styles.editField}>
                <label className={styles.editLabel}>Nationality</label>
                <input
                  type="text"
                  className={styles.editInput}
                  value={editedNationality}
                  onChange={(e) => setEditedNationality(e.target.value)}
                />
              </div>
              <div className={styles.editActions}>
                <button className={styles.cancelEditBtn} onClick={handleCancelEdit} disabled={updateAuthor.isPending}>
                  Cancel
                </button>
                <button className={styles.saveEditBtn} onClick={handleSaveEdit} disabled={updateAuthor.isPending}>
                  {updateAuthor.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              {updateAuthor.error && (
                <p className={styles.editError}>Failed to save changes. Please try again.</p>
              )}
            </>
          ) : (
            <>
              <h1 className={styles.title}>{author.name}</h1>
              {author.bio && (
                <p className={styles.description}>{author.bio}</p>
              )}
              {(author.dateOfBirth || author.nationality) && (
                <div className={styles.meta}>
                  {author.dateOfBirth && (
                    <span className={styles.metaItem}>
                      <FontAwesomeIcon icon={faCalendar} className={styles.metaIcon} />
                      {formatDate(author.dateOfBirth)}
                    </span>
                  )}
                  {author.nationality && (
                    <span className={styles.metaItem}>
                      <FontAwesomeIcon icon={faGlobe} className={styles.metaIcon} />
                      {author.nationality}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {books.length > 0 && (
        <div className={styles.booksSection}>
          <h3 className="section-title">Books by this Author</h3>
          <div className="bn-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Author"
        message={`Are you sure you want to delete "${author.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <AuthorImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        authorId={author.id}
        onImageUpdated={() => setImageKey((k) => k + 1)}
      />
    </div>
  );
}
