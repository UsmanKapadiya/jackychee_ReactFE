import { useMemo } from 'react';
import DOMPurify from 'dompurify';

// Every link opened in a new tab gets rel="noopener noreferrer"
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Renders CMS HTML. The API already sanitises it on save; DOMPurify is a second
 * layer of XSS protection in the browser (defence in depth).
 */
export default function SafeHtml({ html, className, as: Tag = 'div' }) {
  const clean = useMemo(
    () =>
      html
        ? DOMPurify.sanitize(html, {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['target', 'allowfullscreen'],
            ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|#)/i,
          })
        : '',
    [html],
  );
  if (!clean) return null;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
