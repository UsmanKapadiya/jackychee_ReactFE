import { createContext, useContext, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { publicApi } from '../api.js';
import { useApi } from '../hooks.js';
import SafeHtml from './SafeHtml.jsx';

const SiteContext = createContext(null);
export const useSite = () => useContext(SiteContext);

export default function Layout() {
  const { data, error } = useApi((signal) => publicApi.site(signal), []);
  const site = data?.data;
  const location = useLocation();
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // close menus whenever the page changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <SiteContext.Provider value={site}>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <header className={`site-header ${mobileOpen ? 'is-open' : ''}`}>
        <div className="branding">
          <Link to="/" className="logo" aria-label={site?.name || 'Home'}>
            {site?.logo_url ? <img src={site.logo_url} alt={site?.name || ''} /> : <span>{site?.name || 'Jacky Chee'}</span>}
          </Link>
          {site?.tagline && <p className="tagline">{site.tagline}</p>}
        </div>

        <button
          type="button"
          className="mobile-toggle"
          aria-expanded={mobileOpen}
          aria-controls="site-nav"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>

        <nav id="site-nav" className="main-nav" aria-label="Main">
          <div className="nav-row">
            <button
              type="button"
              className="toggle-filter"
              aria-expanded={filterOpen}
              aria-controls="portfolio-filter"
              onClick={() => setFilterOpen((o) => !o)}
            >
              Portfolio
            </button>
            <ul className="nav-menu">
              {site?.menu?.map((p) => (
                <li key={p.slug}>
                  <NavLink to={`/${p.slug}`}>{p.title}</NavLink>
                </li>
              ))}
            </ul>
          </div>
          <ul id="portfolio-filter" className={`filter ${filterOpen || mobileOpen ? 'active' : ''}`}>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            {site?.categories?.map((c) => (
              <li key={c.slug}>
                <NavLink to={`/portfolio-type/${c.slug}`}>{c.name}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="content" className="site-content">
        {error && <p className="notice">The site could not reach the server. Please try again later.</p>}
        <Outlet />
      </main>

      <footer className="site-footer">
        {site?.footer_text ? (
          <SafeHtml html={site.footer_text} className="site-info" />
        ) : (
          <p className="site-info">
            © {new Date().getFullYear()} {site?.name || 'Jacky Chee'}
          </p>
        )}
      </footer>
    </SiteContext.Provider>
  );
}
