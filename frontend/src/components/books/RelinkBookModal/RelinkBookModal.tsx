import { useState, useMemo } from 'react';
import { Modal } from '../../common/Modal';
import styles from './RelinkBookModal.module.css';

interface Author {
  id: string;
  name: string;
}

interface Series {
  id: string;
  name: string;
}

interface RelinkBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  currentAuthor: Author;
  currentSeries: Series | null;
}

const MOCK_AUTHORS: Author[] = [
  { id: '1', name: 'Author 1' },
  { id: '2', name: 'Author 2' },
  { id: '3', name: 'Author 3' },
  { id: '4', name: 'Author 4' },
  { id: '5', name: 'Author 5' },
];

const MOCK_SERIES = [
  { id: '', name: 'No Series' },
  { id: '1', name: 'Series 1' },
  { id: '2', name: 'Series 2' },
  { id: '3', name: 'Series 3' },
];

export function RelinkBookModal({
  isOpen,
  onClose,
  currentAuthor,
  currentSeries,
}: RelinkBookModalProps) {
  const [authorSearch, setAuthorSearch] = useState(currentAuthor.name);
  const [selectedAuthor, setSelectedAuthor] = useState<Author>(currentAuthor);
  const [selectedSeries, setSelectedSeries] = useState<string>(
    currentSeries?.id ?? ''
  );
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

  const handleLinkBook = () => {
    console.log('Linking book:', {
      author: selectedAuthor,
      series: selectedSeries,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link Book" size="md">
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label}>Author</label>
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
                      selectedAuthor.id === author.id ? styles.selected : ''
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

        <div className={styles.field}>
          <label className={styles.label}>Series</label>
          <select
            className={styles.select}
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
          >
            {MOCK_SERIES.map((series) => (
              <option key={series.id} value={series.id}>
                {series.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancel
        </button>
        <button className={styles.primaryBtn} onClick={handleLinkBook}>
          Link Book
        </button>
      </div>
    </Modal>
  );
}
