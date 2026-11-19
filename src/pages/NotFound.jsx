import { Link } from 'react-router';
import { useDocumentTitle } from '../hooks.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <article className="entry">
      <h1 className="entry-title">Page not found</h1>
      <div className="entry-content">
        <p>
          Sorry, this page does not exist. <Link to="/">Back to the portfolio</Link>
        </p>
      </div>
    </article>
  );
}
