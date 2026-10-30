# Meridian Agent Guide

Meridian is a small browser-only timezone planner using React UMD, Framer Motion, Tailwind CDN, Babel, and the browser `Intl` API.

## Working rules

- Read `README.md` before editing.
- The canonical implementation is `index.html` plus `src/app.jsx`.
- Preserve the no-build-step architecture unless the user explicitly requests a migration.
- Keep IANA timezone handling and browser-managed DST behavior intact.
- Prefer direct changes over introducing a framework or build system for isolated work.

## Verify

- Serve or open `index.html` and smoke-test city changes, time scrubbing, AM/PM switching, and return-to-live behavior.
