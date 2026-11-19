# Jacky Chee portfolio: WordPress → React + Laravel 13

This is the old WordPress site (theme **cheez** + **Easy Portfolio**, **ACF**, **Post Types Order**, **Toggle the Title** and **Footer Text** plugins) rebuilt as:

| Part | Stack | Folder |
|---|---|---|
| API + admin back-end | **Laravel 13**, **PHP 8.5.12+**, MySQL 8 / MariaDB 10.6+, Sanctum tokens | `backend/` |
| Public website | **React 19** + React Router 7 + Vite 7 | `frontend/` → e.g. `jackychee.com` |
| Admin panel (separate site) | **React 19** + React Router 7 + Vite 7 | `admin/` → e.g. `admin.jackychee.com` |

## What was converted

| WordPress | New site |
|---|---|
| `portfolio` post type (Easy Portfolio) | `portfolio_items` table, `/api/v1/portfolio` |
| `portfolio_category` taxonomy (`/portfolio-type/...`) | `categories` table, `/portfolio-type/:slug` filter |
| Featured image + WP thumbnails | Re-encoded image + 448px grid thumbnail |
| `_ep_portfoliourl`, `_ep_metatitle`, `_ep_metadesc` | `external_url`, `meta_title`, `meta_description` (also image alt text) |
| Post Types Order (`menu_order`) | `sort_order` + drag-and-drop ordering in the admin |
| Pages + ACF fields `social_icons`, `contact_info`, `portfolio` | `pages` table (`social_icons`, `contact_info`, `extra_content`) |
| Toggle the Title plugin | `show_title` on each page |
| Primary nav menu | `show_in_menu` + `sort_order` on pages |
| `blogname`, `blogdescription`, Footer Text plugin, custom logo | `settings` table (Admin › Settings) |
| jQuery masonry (`cheez.js`) 5/3 columns | `PortfolioGrid.jsx`, same 5 / 3 / 2 column breakpoints and order |
| prettyPhoto lightbox | `Lightbox.jsx` (keyboard, swipe, preloading) |
| `/#!portfolio-type/x` links | redirected automatically to `/portfolio-type/x` |
| wp-admin | Separate admin site (`admin/`): portfolio, drag & drop order, categories, pages, logo, settings, password |

> **Important:** the zip you sent has **no database dump** (`.sql`). In WordPress the titles, categories, order and page text live in the database, not in the files. Export it from the old server (phpMyAdmin › Export, or `mysqldump jackychee_ > jackychee.sql`) and use **Option A** below. If you can't get the database, **Option B** rebuilds the portfolio from the image file names (`021_adv_Ocean-Park.jpg`). Pages and the footer will then need to be re-entered in the admin.

---

## 1. Back-end (Laravel 13 API)

### Server requirements
- **PHP 8.5.12 or newer.** `composer install` refuses older versions. 8.5.12 contains the October 2026 critical security fixes.
- PHP extensions: `ctype curl dom fileinfo filter gd mbstring openssl pdo_mysql session tokenizer xml`
- MySQL 8.0+ or MariaDB 10.6+, Composer 2.8+

### Install
```bash
cd backend
composer install --no-dev --optimize-autoloader
cp .env.example .env          # then edit DB_*, APP_URL, FRONTEND_URLS, ADMIN_EMAIL, ADMIN_PASSWORD
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force   # creates the admin user from ADMIN_EMAIL / ADMIN_PASSWORD
php artisan storage:link
```

### Import the WordPress content

**Option A: from the WordPress database (recommended)**
1. Import the old `.sql` dump into a MySQL database, for example `jackychee_wp`.
2. In `.env`, set `WP_DB_*` to that database (a read-only user is enough) and point `WP_UPLOADS_PATH` at the old `wp-content/uploads` folder.
3. Run:
```bash
php artisan wp:import --skip-images   # quick dry run: data only
php artisan wp:import                 # full import incl. images (several minutes for ~370 images)
```
It is safe to run again: rows are matched on their WordPress IDs. Use `--refresh-images` to re-process images.

**Option B: no database, from file names only**
```bash
php artisan wp:import-uploads /path/to/wp-content/uploads
php artisan wp:import-uploads /path/to/wp-content/uploads --all   # also files like 0076_Darlie_... (saved hidden)
```
Category codes: `adv` → Advertising, `celeb` → Celebrity, `fnb` → Fashion & Beauty, `per` → Personal. These names are guesses; you can rename them in `config/jackychee.php` before importing or in Admin › Categories afterwards.

### Go live
```bash
php artisan config:cache && php artisan route:cache && php artisan event:cache
composer audit                # must report no advisories
```
Add the scheduler to cron (it prunes expired admin tokens):
```
* * * * * cd /home/USER/backend.jackychee.com && php artisan schedule:run >> /dev/null 2>&1
```

**cPanel:** create a sub-domain such as `backend.jackychee.com` with its **document root set to `backend/public`**. Only `public/` may be web-accessible, never the project root.

### Tests
```bash
composer install && php artisan test
```
The tests cover public endpoints, admin authentication, the login rate limit, HTML sanitising (XSS), and rejection of PHP and SVG files disguised as images.

---

## 2. Public website (React)

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=https://backend.jackychee.com/api/v1
npm install
npm run dev                   # http://localhost:5173
npm run build                 # production files in dist/
npm audit --omit=dev
```
Upload the **contents of `dist/`** to the website's `public_html`. The bundled `.htaccess` handles React routing, old WordPress URLs and security headers.
If your API domain is not `backend.jackychee.com`, change it in the `Content-Security-Policy` line of `frontend/public/.htaccess`, then rebuild.

---

## 3. Admin site (React, separate domain)

```bash
cd admin
cp .env.example .env          # VITE_API_URL=https://backend.jackychee.com/api/v1
                              # VITE_SITE_URL=https://jackychee.com
npm install
npm run dev                   # http://localhost:5174
npm run build                 # production files in dist/
```
1. In cPanel, create the sub-domain **`admin.jackychee.com`** and upload the **contents of `admin/dist/`** to its document root.
2. Make sure the admin domain is listed in the API's `.env`:
   `FRONTEND_URLS=https://jackychee.com,https://admin.jackychee.com`. For local development use `http://localhost:5173,http://localhost:5174`. Then run `php artisan config:cache`.
3. Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from the API's `.env` (created by `php artisan db:seed`), then change the password under **Settings**.

The admin site sends `noindex` headers so search engines skip it. If you want extra protection, uncomment the IP allow-list at the bottom of `admin/public/.htaccess`.

| Admin screen | What it does |
|---|---|
| Portfolio | Grid of all work: search, filter by category, **drag & drop to reorder**, show/hide, delete |
| Add / Edit work | Upload image, title, slug, categories, alt text / SEO, project link, description |
| Categories | Add, rename and reorder the menu filter categories |
| Pages | About / Contact etc. with content, social icons, contact info, title toggle, menu on/off, preview |
| Settings | Site name, tagline, footer text, SEO description, **logo upload**, **change password** |

---

## API reference

Public (read-only):
- `GET /api/v1/site`: name, logo, footer, categories, menu pages
- `GET /api/v1/portfolio?category={slug}`: ordered portfolio items
- `GET /api/v1/portfolio/{slug}`: one item + previous/next slugs
- `GET /api/v1/pages/{slug}`: page content

Admin (`Authorization: Bearer <token>`):
- `POST /admin/login` (5 attempts/min), `POST /admin/logout`, `GET /admin/me`, `PUT /admin/password`
- `GET|POST /admin/portfolio`, `GET|PUT|DELETE /admin/portfolio/{id}`, `POST /admin/portfolio/reorder`
- `GET|POST /admin/categories`, `PUT|DELETE /admin/categories/{id}`
- `GET|POST /admin/pages`, `GET|PUT|DELETE /admin/pages/{id}`
- `GET|PUT /admin/settings`, `POST /admin/settings/logo`

See **SECURITY.md** for the vulnerability review and hardening details.
