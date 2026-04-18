# Meridian — Timezone Planner

A beautiful, interactive timezone coordination tool for teams spread across the globe. Scrub through time, see what everyone's doing at a glance, and plan across timezones without friction.

![Meridian Desktop](screenshots/desktop.png)

---

## Getting Started

No build step required. Open directly in any modern browser:

```bash
open index.html
```

Or serve locally:

```bash
npx serve .
# -> http://localhost:3000
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
├── index.html          # Entry point — loads deps, mounts React
├── src/
│   ├── hook.jsx        # useTimezones — state, math, TZ_LIBRARY (50+ cities)
│   ├── app.jsx         # Root component, layout (desktop + mobile)
│   ├── cards.jsx       # TimeCard — tinted comparison cards
│   ├── circle.jsx      # CircleControl — 24-hour full-dial
│   ├── semicircle.jsx  # SemicircleControl — 12-hour arc dial
│   └── picker.jsx      # TimezonePicker — popover (desktop) + sheet (mobile)
└── screenshots/
    └── desktop.png
```

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 (UMD, no build step) |
| Animation | Framer Motion 11 |
| Styling | Tailwind CSS (CDN) + CSS custom properties |
| Color | OKLch perceptual color model |
| Fonts | Inter, Instrument Serif, JetBrains Mono |
| Transpilation | Babel standalone (in-browser) |

## Adding Cities

Edit `TZ_LIBRARY` in `src/hook.jsx`. Each entry needs:

```js
{ id: 'America/Chicago', city: 'Chicago', country: 'USA', code: 'ORD' }
```

`id` must be a valid [IANA timezone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Theming

CSS variables are defined at the top of `index.html`. Accent color can also be changed at runtime via the Settings panel.

## Known Limitations

- CDN-dependent — requires internet for React, Tailwind, fonts, and Framer Motion
- No build step, no TypeScript, no tests — JSX transpiled in-browser by Babel
- DST transitions handled by the browser's `Intl` API; half-hour and 45-minute offsets are fully supported
