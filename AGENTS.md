# Repository Guidelines

## Project Structure & Module Organization

ShopLedger is a small Node/Express POS, inventory, Khata, and GST invoicing app. `server.js` wires the app and serves `public/`. API endpoints are in `routes/`; business logic is in `lib/` (pricing, tax, inventory, ledger, orders, reports, invoices, and JSON storage). Browser assets are in `public/index.html`, `public/js/`, and `public/css/`. `config.js` contains shop, tax, inventory, and coupon settings. `data/db.json` is the application data store, `docs/architecture.svg` documents the architecture, and `test/` contains Node's built-in test suite.

## Build, Test, and Development Commands

- `npm start` — starts the Express server on port 3000, or `PORT` if set.
- `npm test` — currently a placeholder that exits with “no test specified”; do not treat it as a passing test suite.

There is no build, lint, or formatting script configured. Avoid using live production data for local experiments because the app writes directly to `data/db.json`.

## Coding Style & Naming Conventions

Match the existing CommonJS JavaScript style: two-space indentation, `var`, semicolons, single-quoted strings, and small modules under `lib/`. Use lowercase filenames such as `gst-reconciliation.js` only when consistent with neighboring names (currently simple names like `pricing.js` are used). Export named functions from libraries and keep HTTP request/response handling in route modules. The browser client is plain JavaScript; keep its conventions consistent with `public/js/app.js`. No formatter or linter is configured.

## Testing Guidelines

No test framework or coverage requirement is present. For changes to pricing, tax, inventory, Khata, or invoice calculations, manually verify representative valid and invalid cases and compare order ledger totals with printable invoice totals. Do not claim `npm test` validates changes until a real suite replaces the placeholder.

## Commit & Pull Request Guidelines

Recent commits use short, lowercase, descriptive summaries (for example, `support hsn gst slabs and coupon maxDiscount caps`). Follow that style and keep each commit focused. Pull requests should explain behavior changes, list manual verification performed, note any `data/db.json` or configuration impact, and include screenshots for visible UI changes. Link related issues when available.

## Security & Data Handling

Do not commit real customer data, credentials, or secrets. Review `config.js` before deployment: it contains an admin key and shop details. Changes to storage or order calculations should preserve valid JSON data and be checked for consistency between checkout, reports, and invoices.
