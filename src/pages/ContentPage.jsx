import { useParams } from 'react-router';
import { publicApi } from '../api.js';
import { useApi, useDocumentTitle } from '../hooks.js';
import { useSite } from '../components/Layout.jsx';
import SafeHtml from '../components/SafeHtml.jsx';
import NotFound from './NotFound.jsx';

/** WordPress pages (About, Contact ...) incl. the ACF fields social_icons / contact_info / portfolio. */
export default function ContentPage() {
  const { slug } = useParams();
  const site = useSite();
  const { data, error, loading } = useApi((signal) => publicApi.page(slug, signal), [slug]);
  const page = data?.data;

  useDocumentTitle(page?.title, site?.name);

  if (error?.status === 404) return <NotFound />;
  if (error) return <p className="notice">Could not load this page.</p>;
  if (loading || !page) return <div className="loading">Loading…</div>;

  return (
    <article className="entry">
      <h1 className={page.show_title ? 'entry-title' : 'visually-hidden'}>{page.title}</h1>
      <div className="entry-content">
        <SafeHtml html={page.content} />
        <SafeHtml html={page.social_icons} className="social-icons" />
        <SafeHtml html={page.contact_info} className="contact-info" />
        <SafeHtml html={page.extra_content} className="extra-content" />
      </div>
    </article>
  );
}
