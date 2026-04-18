# Meridian — Timezone Planner

A beautiful, interactive timezone coordination tool for teams spread across the globe. Scrub through time, see what everyone's doing at a glance, and plan across timezones without friction.

## Getting Started

No build step required. Open directly in any modern browser:

```bash
open index.html
```

Or serve locally:

```bash
npx serve .
```

## Usage

| Action | How |
|---|---|
| **Change anchor city** | Click the city name below the clock |
| **Swap a comparison city** | Click the city card |
| **Remove a city** | Hover the card, click x |
| **Add a city** | Click the dashed "+ Add city" button |
| **Scrub time** | Drag the handle on the clock dial |
| **Flip AM/PM** | Tap/click the handle |
| **Return to live** | Click the "Live" / "Jump to now" badge |

## Project Structure

```
.
├── index.html      # Entry point — loads deps, mounts React
└── src/
    └── app.jsx     # Entire app in one file (hook, components, layout)
```

## Tech Stack

React 18 (UMD), Framer Motion 11, Tailwind CSS (CDN), Babel standalone, OKLch color, Google Fonts (Inter, Instrument Serif, JetBrains Mono).

## Adding Cities

Edit `TZ_LIBRARY` in `src/app.jsx`:

```js
{ id: 'America/Chicago', city: 'Chicago', country: 'USA', code: 'ORD' }
```

`id` must be a valid [IANA timezone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Theming

CSS variables are defined at the top of `index.html`.

## Known Limitations

- CDN-dependent — requires internet for React, Tailwind, fonts, and Framer Motion
- No build step, no TypeScript, no tests — JSX transpiled in-browser by Babel
- DST transitions handled by the browser's `Intl` API; half-hour and 45-minute offsets are fully supported
