import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  debounceMs?: number;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  debounceMs = 300,
  autoFocus = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? '');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const debouncedOnChange = useCallback(
    (newValue: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onChange?.(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!isControlled) {
      setInternalValue(newValue);
    }

    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    onChange?.('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={styles.searchBar}>
      <FontAwesomeIcon icon={faMagnifyingGlass} />
      <input
        type="text"
        placeholder={placeholder}
        className={styles.input}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      />
      <button
        className={`${styles.clearBtn} ${currentValue ? styles.visible : ''}`}
        onClick={handleClear}
        aria-label="Clear search"
        type="button"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}
