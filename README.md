# ClearStep

Static learning platform for General English and SAT Reading & Writing / Math. The app runs as a static site and can be launched locally without a build step.

## Run locally

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in the browser.

Notes:
- The app works in local mode without a published deployment.
- Email sign-in, cloud sync, and account features require a configured Supabase project and browser-side config values.
- If Supabase is not configured, only the offline/local experience is available.

## Current project structure

This repository uses a flat root structure; the older `data/` and `js/` paths are not present in the current codebase.

- `index.html`, `styles.css`, `app.js` — main UI shell and application logic.
- `config.js`, `auth.js` — browser-side Supabase configuration and auth adapter.
- `curriculum.js`, `roadmap.js`, `questions.js` — core course metadata and question registry.
- `en-*.js`, `rw-*.js`, `math-*.js`, `sat-*.js`, `*-stage*.js`, `*-level*.js` — stage and module content, question banks, and learning paths.
- `lesson-*.js` — lesson summaries, rules, examples, and recap content.
- `vocabulary*.js`, `i18n-uz.js` — vocabulary sets and Uzbek UI translations.
- `schema.sql`, `SUPABASE_SETUP.md` — Supabase schema and setup documentation.
- `validate-data.js` — local structural validation script for curriculum and data integrity.

## Validation

From the repository root, run:

```bash
node validate-data.js
```

The validator checks:
- module coverage and required lesson data,
- minimum question counts per unit,
- duplicates and invalid question IDs,
- vocabulary and translation integrity,
- Supabase security rules and browser-side config constraints.

## Important notes

- The project is intentionally static and does not require a Node build pipeline for regular use.
- The content has been checked by the author, but an independent editorial verification is still desirable.
- Device sync, offline recovery, and edge-case persistence scenarios still need separate verification before being treated as fully proven.
- For task or content issues, use the in-app feedback flow so reports are captured with the exact problem context.
