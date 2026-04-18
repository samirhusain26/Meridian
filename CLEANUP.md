# Meridian — Cleanup & Simplification Plan

## What was already done

- **Flattened directory structure** — removed the unnecessary `project/` wrapper. `index.html` and `src/` now live at root.
- **Removed junk files** — `scraps/` (napkin sketch), `uploads/` (pasted image), `sqlite_mcp_server.db`, `.DS_Store`.
- **Updated README** — fixed paths, removed reference to non-existent `tweaks.jsx`, trimmed redundant sections (features list that duplicated usage table, customization details covered by theming section).

---

## Remaining simplification opportunities

### 1. Consolidate source files (high impact)

The app is 6 JSX files loaded via separate `<script>` tags with global `window.*` exports. This works but is fragile (load order matters, no module boundaries).

**Option A — Single file:** Merge all 6 files into one `app.jsx`. The total is ~1100 lines, which is manageable for a no-build project. Eliminates the `window.*` wiring entirely.

**Option B — ES modules:** Switch from Babel-in-browser to a light bundler (Vite). Enables `import/export`, HMR during dev, and production builds. Adds a build step but modernizes the project significantly.

### 2. Remove the TZ_CANONICAL map (~90 lines)

`hook.jsx` contains a large alias map (`TZ_CANONICAL`) that maps obscure IANA sub-zones to canonical entries. This is only used for auto-detecting the user's local timezone on first visit. A simpler approach: if the detected zone isn't in `TZ_LIBRARY`, default to `America/New_York` (which it already does as a final fallback). The alias map could be cut entirely with minimal UX impact — the only downside is that a user in, say, `Europe/Vienna` wouldn't auto-select `Europe/Berlin` on first load.

### 3. Deduplicate Sun/Moon icons

`SunIcon` and `MoonIcon` are defined independently in `semicircle.jsx`, `circle.jsx`, and inline in `cards.jsx`. Extract once and reuse.

### 4. Inline styles -> CSS classes

Many components use long inline `style={{}}` objects (especially the handle buttons in semicircle/circle). Moving these to CSS classes or Tailwind utilities would make the JSX more readable.

### 5. Remove dead code

- `dayLabelFor()` in `hook.jsx` (line 231) is defined but never called.
- `execCopy()` in `app.jsx` — the `document.execCommand('copy')` fallback is for non-HTTPS contexts. If you'll always serve over HTTPS, this can be removed.
- `TZ_CANONICAL['America/St_Johns']` maps to itself — no-op entry.

### 6. Simplify the tint system

`cards.jsx` has a manual piecewise-linear color interpolation across 10 stops. This could be simplified to a CSS `color-mix()` approach or reduced to fewer stops (dawn/day/dusk/night = 4 stops) without visible quality loss.

### 7. Add a .gitignore

The project has no `.gitignore`. Should exclude at minimum: `.DS_Store`, `node_modules/`, `*.db`.

---

## Recommended priority

1. Add `.gitignore` (trivial, do now)
2. Remove dead code (quick wins, lines 231 `dayLabelFor`, self-mapping alias)
3. Deduplicate icons (small refactor)
4. Consolidate to single file or add Vite (bigger decision — depends on whether you want to keep the zero-build-step philosophy)
