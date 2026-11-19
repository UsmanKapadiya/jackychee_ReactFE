const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Request failed (${status})`);
    this.status = status;
  }
}

/** Public, read-only API calls. The admin panel is a separate app (see /admin folder). */
async function get(path, signal) {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' }, signal, credentials: 'omit' });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

export const publicApi = {
  site: (signal) => get('/site', signal),
  portfolio: (category, signal) => get(`/portfolio${category ? `?category=${encodeURIComponent(category)}` : ''}`, signal),
  portfolioItem: (slug, signal) => get(`/portfolio/${encodeURIComponent(slug)}`, signal),
  page: (slug, signal) => get(`/pages/${encodeURIComponent(slug)}`, signal),
};
