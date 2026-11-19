import { useState } from 'react';
import { useParams } from 'react-router';
import { publicApi } from '../api.js';
import { useApi, useDocumentTitle } from '../hooks.js';
import { useSite } from '../components/Layout.jsx';
import PortfolioGrid from '../components/PortfolioGrid.jsx';
import Lightbox from '../components/Lightbox.jsx';
import NotFound from './NotFound.jsx';

/** Home page = full portfolio. /portfolio-type/:category = filtered portfolio. */
export default function Home() {
  const { category } = useParams();
  const site = useSite();
  const { data, error, loading } = useApi((signal) => publicApi.portfolio(category, signal), [category]);
  const [open, setOpen] = useState(null);

  const categoryName = site?.categories?.find((c) => c.slug === category)?.name;
  useDocumentTitle(categoryName, site?.name);

  if (error?.status === 422) return <NotFound />;
  if (error) return <p className="notice">Could not load the portfolio.</p>;

  const items = data?.data ?? [];

  return (
    <section className="portfolio" aria-busy={loading}>
      <h1 className="visually-hidden">{categoryName || site?.name || 'Portfolio'}</h1>
      {loading && !data ? <div className="loading">Loading…</div> : null}
      {!loading && items.length === 0 ? <p className="notice">No work in this category yet.</p> : null}
      <PortfolioGrid items={items} onOpen={setOpen} />
      {open !== null && <Lightbox items={items} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
