import { useState, useMemo } from 'react';
import { Modal } from '../../common/Modal';
import styles from './RelinkSeriesModal.module.css';

interface Author {
  id: string;
  name: string;
}

interface RelinkSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId: string;
  currentAuthor: Author | null;
}

const MOCK_AUTHORS: Author[] = [
  { id: '1', name: 'George R.R. Martin' },
  { id: '2', name: 'J.K. Rowling' },
  { id: '3', name: 'Brandon Sanderson' },
  { id: '4', name: 'Patrick Rothfuss' },
  { id: '5', name: 'Stephen King' },
];

export function RelinkSeriesModal({
  isOpen,
  onClose,
  currentAuthor,
}: RelinkSeriesModalProps) {
  const [authorSearch, setAuthorSearch] = useState(currentAuthor?.name || '');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(currentAuthor);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredAuthors = useMemo(() => {
    if (!authorSearch) return MOCK_AUTHORS;
    return MOCK_AUTHORS.filter((author) =>
      author.name.toLowerCase().includes(authorSearch.toLowerCase())
    );
  }, [authorSearch]);

  const handleAuthorSelect = (author: Author) => {
    setSelectedAuthor(author);
    setAuthorSearch(author.name);
    setIsDropdownOpen(false);
  };

  const handleAuthorInputChange = (value: string) => {
    setAuthorSearch(value);
    setIsDropdownOpen(true);
  };

  const handleLinkSeries = () => {
    console.log('Linking series to author:', selectedAuthor);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link Series to Author" size="md">
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label}>Author</label>
          <p className={styles.hint}>
            Select the author this series belongs to
          </p>
          <div className={styles.dropdownContainer}>
            <input
              type="text"
              className={styles.input}
              value={authorSearch}
              onChange={(e) => handleAuthorInputChange(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              placeholder="Search authors..."
            />
            {isDropdownOpen && (
              <div className={styles.dropdown}>
                {filteredAuthors.map((author) => (
                  <div
                    key={author.id}
                    className={`${styles.dropdownItem} ${
                      selectedAuthor?.id === author.id ? styles.selected : ''
                    }`}
                    onClick={() => handleAuthorSelect(author)}
                  >
                    {author.name}
                  </div>
                ))}
                {filteredAuthors.length === 0 && (
                  <div className={styles.dropdownItem}>No authors found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button className={styles.primaryBtn} onClick={handleLinkSeries}>
          Link Series
        </button>
      </div>
    </Modal>
  );
}
