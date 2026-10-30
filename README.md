# ERP Software Base Module (Vite + Vanilla JS)

Minimal single-page app serving as an Enterprise Resource Planning (ERP) software base module. It provides the common foundation for building custom ERP modules: master data management (Entities) and linked transactional documents (Documents) with create/edit/delete/search, validation, and browser localStorage persistence — using Vite and vanilla HTML, CSS, and JavaScript.

The user interface is fully in **Spanish** (default terms: Entidad / Documento; module name: ERP Base), including labels, validation messages, empty states, and dialogs.

Entities carry standard ERP master-data fields (name, code, tax ID, email, phone, address, category, target date, credit limit, payment terms). Documents use series + folio numbering and carry a monetary breakdown (subtotal, discount, tax, total), currency, payment terms, notes, quantity, dates, and status.

The app presents itself as a coherent ERP workspace:

- **Workspace shell** — every screen lives inside a branded chrome: a top bar with a logo (an SVG monogram derived from the module name) and module name, plus a persistent sidebar of module buttons (Panel, Entidades, Documentos, Buscar). The active module is highlighted (`aria-current="page"`), and the sidebar collapses to an icon rail on narrow viewports.
- **Home dashboard** — the entry screen offers quick-action buttons for key ERP tasks (new entity, new document, open management areas, find records) and live statistic cards showing record counts.
- **Design tokens** — styling is driven by CSS custom properties in `src/styles.css`, so branding changes apply globally.

## Project Structure

```text
index.html              Static shell with all views and forms
src/
  main.js               Entry point (loads userConfig and boots the app)
  app.js                Routing, label/theme application, event wiring
  storage.js            localStorage persistence and cascade deletion
  validation.js         Entity/document/custom-field/status validation
  module-config.js      Defaults, userConfig, normalization and fallbacks
  search.js             Entity search
  utils.js              Escaping, IDs, date checks, text normalization
  styles.css            Design tokens, layout, responsive sidebar
  components/           Shell, dashboard, forms, lists, search bar
tests/
  unit/                 Storage, validation, config, search, security
  integration/          User-story flows, performance
  setup/                jsdom setup and index.html fixture loader
```

## Setup

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or the URL Vite prints).

## Tests

Run the full test suite (unit + integration) with:

```bash
npm test
```

Or a one-off run without watch mode:

```bash
npx vitest run
```

## Build

Create a production build and preview it locally:

```bash
npm run build
npm run preview
```

## Building Custom Modules

Custom ERP modules built on this base define:

- What an **Entity** represents (e.g., customer, product, asset) plus domain-specific fields.
- What a **Document** represents (e.g., order, invoice, contract).
- Module-specific labels and validation rules.

The base module handles identity generation, timestamps, referential integrity between entities and documents, cascade deletion, navigation, and search. See `specs/001-erp-base-module/` for the full specification.

## Tailoring via Configuration

All tailoring lives in one place: the `userConfig` object at the top of `src/module-config.js`. Developers edit this single export; no core code changes are required. Available knobs:

- `moduleName` — display name shown in the top bar, dashboard, and document title; also derives the logo monogram.
- `labels` — rename Entity/Document terms across every screen, including sidebar buttons, quick actions, forms, lists, search, and messages. Terms are lowercased where they appear inside sentences such as "Nueva entidad" or "No hay entidades todavía".
- `customFields` — declare extra fields per record type with `target` (`entity` or `document`), `key`, `label`, `type` (`text`, `number`, `date`, or `select`), optional `required`, and `options` for selects. Keys must not collide with base field names (see `specs/001-erp-base-module/data-model.md`). Values persist alongside records and appear in search results.
- `statusLifecycle` — restrict document statuses to a configured list of `statuses` with permitted `transitions` between them. Without it, status stays a free-form field.
- `theme.accentColor` — a hex color (e.g., `"#0f62fe"`) applied across the shell as highlights and primary controls. Invalid values fall back to the default.

If the configuration is invalid (missing name, unknown field types, key collisions, select fields without options, transitions referencing unknown statuses, invalid CSS colors), the app shows the problems in a non-blocking banner and falls back to defaults instead of breaking.

## localStorage Keys

| Key | Content |
|---|---|
| `erp.entities` | Serialized entity array |
| `erp.documents` | Serialized document array |
| `erp.schemaVersion` | Schema version written on each save |

## Notes

- Deleting an entity also deletes all its documents (cascade).
- All user-provided content is rendered as text or escaped HTML; it is never executed as markup.
- This project intentionally uses vanilla HTML, CSS, and JavaScript for simplicity.
