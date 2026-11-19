import { Link } from 'react-router';
import { useColumns } from '../hooks.js';

/**
 * Masonry grid. Items are dealt into columns left-to-right (item k -> column k % n),
 * exactly like the old cheez.js "arrange_manson" function, so the order is preserved.
 */
export default function PortfolioGrid({ items, onOpen }) {
  const cols = useColumns();
  const columns = Array.from({ length: cols }, () => []);
  items.forEach((item, k) => columns[k % cols].push({ item, index: k }));

  return (
    <div className="portfolio-grid" style={{ '--cols': cols }}>
      {columns.map((col, c) => (
        <div className="portfolio-col" key={c}>
          {col.map(({ item, index }) => (
            <figure className="portfolio-item" key={item.id}>
              <button type="button" className="zoom" onClick={() => onOpen(index)} aria-label={`Open ${item.title}`}>
                <img
                  src={item.thumb_url}
                  alt={item.alt}
                  loading={index < cols * 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  width={item.width || undefined}
                  height={item.height || undefined}
                />
              </button>
              <figcaption className="visually-hidden">
                <Link to={`/portfolio/${item.slug}`}>{item.title}</Link>
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}
