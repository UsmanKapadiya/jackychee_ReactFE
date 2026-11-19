import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { publicApi } from '../api.js';
import { useApi, useDocumentTitle } from '../hooks.js';
import { useSite } from '../components/Layout.jsx';
import SafeHtml from '../components/SafeHtml.jsx';
import Lightbox from '../components/Lightbox.jsx';
import NotFound from './NotFound.jsx';

export default function PortfolioDetail() {
  const { slug } = useParams();
  const site = useSite();
  const { data, error, loading } = useApi((signal) => publicApi.portfolioItem(slug, signal), [slug]);
  const [zoom, setZoom] = useState(false);
  const item = data?.data;

  useDocumentTitle(item?.meta_title?.startsWith('uploads:') ? item?.title : item?.meta_title || item?.title, site?.name);

  if (error?.status === 404) return <NotFound />;
  if (error) return <p className="notice">Could not load this work.</p>;
  if (loading || !item) return <div className="loading">Loading…</div>;

  return (
    <article className="entry portfolio-detail">
      <h1 className="entry-title">{item.title}</h1>
      <button type="button" className="zoom detail-image" onClick={() => setZoom(true)} aria-label="View full size">
        <img src={item.image_url} alt={item.alt} width={item.width || undefined} height={item.height || undefined} />
      </button>
      <SafeHtml html={item.description} className="entry-content" />
      {item.categories?.length > 0 && (
        <p className="entry-meta">
          {item.categories.map((c) => (
            <Link key={c.slug} to={`/portfolio-type/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </p>
      )}
      {item.external_url && (
        <p>
          <a href={item.external_url} target="_blank" rel="noopener noreferrer">
            Go to project
          </a>
        </p>
      )}
      <nav className="post-nav" aria-label="More work">
        {data.prev ? <Link to={`/portfolio/${data.prev}`}>← Previous</Link> : <span />}
        {data.next ? <Link to={`/portfolio/${data.next}`}>Next →</Link> : <span />}
      </nav>
      {zoom && <Lightbox items={[item]} index={0} onChange={() => {}} onClose={() => setZoom(false)} />}
    </article>
  );
}
