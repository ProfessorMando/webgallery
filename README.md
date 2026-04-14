# webgallery

A UI element gallery.

## Cloudflare deployment notes

This repo now includes a `_headers` file for Cloudflare Pages to:
- set safe defaults for `X-Content-Type-Options`, `Referrer-Policy`, and `X-Frame-Options`
- avoid stale HTML by forcing revalidation on `*.html`
- allow long-lived caching for `styles.css` and `theme.js`

### If you deploy with Cloudflare Pages
No extra setup is needed for these headers; Pages reads `_headers` automatically.

### If you deploy with a Cloudflare Worker
`_headers` is not applied automatically by a Worker route. You need to set equivalent headers in your Worker response code.
