import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HorizontalScroll.module.css';

interface HorizontalScrollProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => ReactNode;
  itemWidth?: 'author' | 'book' | 'series';
  seeMorePath?: string;
}

export function HorizontalScroll<T extends { id: string }>({
  title,
  items,
  renderItem,
  itemWidth = 'book',
  seeMorePath,
}: HorizontalScrollProps<T>) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft]
  );

  useEffect(() => {
    const handleWindowMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, []);

  const itemWidthClass = {
    author: styles.itemAuthor,
    book: styles.itemBook,
    series: styles.itemSeries,
  }[itemWidth];

  const handleSeeMore = () => {
    if (seeMorePath) {
      navigate(seeMorePath);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {seeMorePath && (
          <button className={styles.seeMore} onClick={handleSeeMore}>
            See More
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        className={`${styles.scroll} ${isDragging ? styles.dragging : ''}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {items.map((item) => (
          <div key={item.id} className={`${styles.item} ${itemWidthClass}`}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
}
