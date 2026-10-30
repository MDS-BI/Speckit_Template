# ERP Base Module Constitution

## Core Principles

### I. Modular Base, Single Config Surface
Core code MUST stay domain-agnostic. All domain adaptation (terminology, custom fields,
document lifecycle, accent color) MUST happen only through `src/module-config.js`.
Domain strings or fields MUST NOT be hardcoded in core modules; any new customization point
requires a config key and a safe default.

### II. Test-First (NON-NEGOTIABLE)
Every functional change MUST have a Vitest unit or integration test that is written and failing
before implementation. The core flows (create, edit, delete, search, cascade, config fallback)
MUST have automated coverage. `npm test` MUST pass before a task is considered complete.

### III. Consistent ERP Workspace UX
Every screen MUST render inside the persistent shell (top bar + sidebar). All visible labels MUST
derive from configuration. Accessibility is mandatory: form labels, logical keyboard focus order,
and `aria-current` on the active module. Validation messages MUST be clear and field-associated.

### IV. Measurable Performance
Search and list rendering MUST complete in <= 100 ms for 500 records using targeted DOM updates,
never a full document re-render. Performance claims MUST be backed by a repeatable check.

### V. Simplicity and Local-First
No backend and no heavy UI framework. Data MUST persist in browser localStorage. Dependencies
MUST stay minimal and justified (YAGNI). The app MUST build and run with a simple static deploy.

## Additional Constraints

Technology stack: JavaScript (ES2022), HTML, CSS, Vite, Vitest + jsdom.
User-derived content MUST be escaped before DOM insertion per `contracts/security.md`
(`textContent` or explicit escaping; no unsanitized `innerHTML`).
Data model and storage follow `specs/001-erp-base-module/data-model.md`.

## Development Workflow

Work proceeds by user story in priority order (P1 before P2). Tests precede implementation.
Before completion, verify the 500-record performance check and run both quality gates:
`npm test` and `npm run build`. A task checkbox MAY be marked complete only when the referenced
files exist and its tests pass.

## Governance

This constitution supersedes other practices. Any conflict between this constitution and a spec,
plan, or task MUST be resolved in favor of the constitution. Amendments require documented
approval and a migration note. Complexity MUST be justified in the plan's Complexity Tracking
section. All reviews and PRs MUST verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-07-08 | **Last Amended**: 2026-07-08
