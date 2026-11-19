# Security review and hardening

## 1. Problems found in the old WordPress files

| # | Found in the zip | Risk | Status in the new build |
|---|---|---|---|
| 1 | `phpinfo.php` publicly reachable | Exposes PHP version, paths and server config to attackers | Removed; not part of the new code |
| 2 | `phpmyadmin/` **4.4.15.8 (2016)** inside the web root | Many known CVEs; direct database access from the internet | Removed. Use cPanel's own phpMyAdmin |
| 3 | `wp-config.php` connects as **`root` with an empty password** | Full database takeover if anything leaks | New app uses its own DB user (`DB_USERNAME`) with a password; the importer needs SELECT only |
| 4 | Easy Portfolio 1.2 (abandoned) prints post meta **unescaped** (`echo $portfoliourl`, `$metatitle`) | Stored XSS | All HTML is sanitised on save (Symfony HtmlSanitizer) **and** in the browser (DOMPurify); React escapes all other text |
| 5 | ACF 4.4.11, Akismet 3.2, "Increase upload max filesize" and other outdated plugins | Known plugin vulnerabilities | No WordPress plugins remain |
| 6 | `xmlrpc.php`, `wp-login.php` | Brute-force and amplification target | Not present; front-end `.htaccess` answers these URLs with `410 Gone` |
| 7 | `php.ini` / `php5.ini` in the web root | Info leak; outdated PHP 5 settings | Not used |
| 8 | Image uploads only checked by extension | Malicious file upload | Content-based validation, random file names, GD re-encode, PHP execution blocked |

**After the new site is live, delete the old `jackychee/` WordPress folder from the server** (keep an offline backup), and drop or lock the old database.

## 2. Protections in the new code

**Platform**
- `composer.json` requires **PHP `^8.5.12`**. Composer's platform check stops the app on unpatched PHP versions.
- Laravel 13 is supported with security fixes until Q1 2028, and PHP 8.5 until 31 Dec 2029.
- `composer audit` is configured to fail on abandoned packages. Run `composer audit` and `npm audit` before each deploy.
- PHP 8.5 deprecation-safe: uses `Pdo\Mysql::ATTR_SSL_CA` instead of the deprecated `PDO::MYSQL_ATTR_SSL_CA`, typed class constants, and no dynamic properties.

**Injection / XSS**
- All database access goes through Eloquent / Query Builder with bound parameters. There is no raw SQL string-building, and the `LIKE` search escapes `%` and `_`.
- Route slugs are restricted to `[A-Za-z0-9-_]`, and query input is validated (`alpha_dash`, integer ranges, max lengths).
- Rich text is sanitised on save. The sanitiser drops `<script>`, `on*=` handlers and `javascript:` URLs; iframes are allowed only from YouTube and Vimeo, and `rel="noopener noreferrer"` is forced on links.
- The importer `unserialize()`s WordPress options with `allowed_classes => false`, which prevents PHP object injection.
- Importer file paths are checked with `realpath()` against the uploads folder, which prevents path traversal.

**Authentication**
- Admin uses Sanctum Bearer tokens that **expire after 8 hours** (`SANCTUM_TOKEN_EXPIRATION`). Expired tokens are pruned daily, and logout revokes the token.
- Login is limited to **5 attempts/minute per email+IP and 30/hour per IP**. It returns the same error for an unknown email and a wrong password, and runs a constant-time hash check.
- Password policy in production: at least 12 characters, mixed case, a number, a symbol, and not found in known breach lists (`uncompromised()`).
- Changing the password signs out all other devices.
- The admin panel is a **separate site** (`admin.jackychee.com`). Public visitors never download any admin code, and the admin site sends `noindex` headers and an optional IP allow-list.
- The token is kept in `sessionStorage` (cleared when the tab closes) and is never sent as a cookie, so CSRF does not apply.

**Uploads**
- Only JPEG, PNG, WebP and GIF are accepted, checked by content (`getimagesize` + MIME), with a 15 MB limit and dimension limits. **SVG is rejected.**
- Images are re-encoded with GD. This strips EXIF/GPS data and anything hidden in the file. Files are saved under random names.
- `public/.htaccess` lets only `index.php` run as PHP, so a stray uploaded `.php` file cannot execute. Hidden files (`.env`, `.git`) are blocked.

**HTTP**
- The API sends `X-Content-Type-Options`, `X-Frame-Options: DENY`, a strict `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`, and HSTS on HTTPS. `X-Powered-By` is removed.
- The front-end `.htaccess` sends a CSP that allows only its own scripts, the API host and Google Fonts.
- CORS allows only the origins in `FRONTEND_URLS`; there is no wildcard.
- Errors are always returned as JSON. `APP_DEBUG=false` by default, so stack traces are never shown.
- The session cookie is encrypted and `Secure`, and production forces HTTPS.

## 3. Deployment checklist
- [ ] Server runs PHP **8.5.12 or newer** (`php -v`)
- [ ] `.env`: `APP_ENV=production`, `APP_DEBUG=false`, strong `DB_PASSWORD`, correct `FRONTEND_URLS`
- [ ] The API sub-domain's document root is `backend/public`
- [ ] `storage/` and `bootstrap/cache/` are writable (755 for folders, 644 for files); `.env` is 600
- [ ] `composer audit` and `npm audit --omit=dev` are clean
- [ ] The default admin password has been changed in Admin › Settings
- [ ] The old WordPress folder, `phpmyadmin/` and `phpinfo.php` are deleted from the server
- [ ] Cron `schedule:run` is set up
- [ ] HTTPS certificate is active (cPanel AutoSSL)
