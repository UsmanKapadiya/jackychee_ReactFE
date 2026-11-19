import { useCallback, useEffect, useRef } from 'react';

/** Full-screen image viewer (replaces the old jQuery prettyPhoto plugin). Keyboard + swipe. */
export default function Lightbox({ items, index, onChange, onClose }) {
  const item = items[index];
  const closeRef = useRef(null);
  const touchX = useRef(null);

  const prev = useCallback(() => onChange((index - 1 + items.length) % items.length), [index, items.length, onChange]);
  const next = useCallback(() => onChange((index + 1) % items.length), [index, items.length, onChange]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('lightbox-open');
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('lightbox-open');
    };
  }, [onClose, prev, next]);

  // preload neighbours
  useEffect(() => {
    [items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]].forEach((i) => {
      if (i?.image_url) new Image().src = i.image_url;
    });
  }, [index, items]);

  if (!item) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
        touchX.current = null;
      }}
    >
      <p className="lightbox-title">{item.title}</p>
      <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      {items.length > 1 && (
        <>
          <button type="button" className="lightbox-prev" onClick={prev} aria-label="Previous image">
            ‹
          </button>
          <button type="button" className="lightbox-next" onClick={next} aria-label="Next image">
            ›
          </button>
        </>
      )}
      <img className="lightbox-img" src={item.image_url} alt={item.alt} />
    </div>
  );
}
