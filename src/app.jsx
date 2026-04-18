// Meridian — Timezone Planner (single-file build)
const { useState, useEffect, useMemo, useCallback, useRef } = React;
const { motion, AnimatePresence } = Motion;

// ─── Shared Icons ────────────────────────────────────────────────────────────

function SunIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2"/><path d="M12 20v2"/>
      <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
      <path d="M2 12h2"/><path d="M20 12h2"/>
      <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function HorizonIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="16" r="4"/><path d="M3 20h18"/><path d="M12 8v2"/><path d="M5 12l1.5 1.5"/><path d="M19 12l-1.5 1.5"/>
    </svg>
  );
}

// ─── Timezone Data ───────────────────────────────────────────────────────────

const TZ_LIBRARY = [
  // Americas — West
  { id: 'Pacific/Honolulu',    city: 'Honolulu',      country: 'USA',        code: 'HNL' },
  { id: 'America/Anchorage',   city: 'Anchorage',     country: 'USA',        code: 'ANC' },
  { id: 'America/Los_Angeles', city: 'Los Angeles',   country: 'USA',        code: 'LAX' },
  { id: 'America/Vancouver',   city: 'Vancouver',     country: 'Canada',     code: 'YVR' },
  { id: 'America/Denver',      city: 'Denver',        country: 'USA',        code: 'DEN' },
  { id: 'America/Boise',       city: 'Boise',         country: 'USA',        code: 'BOI' },
  { id: 'America/Phoenix',     city: 'Phoenix',       country: 'USA',        code: 'PHX' },
  { id: 'America/Chicago',     city: 'Chicago',       country: 'USA',        code: 'ORD' },
  { id: 'America/Mexico_City', city: 'Mexico City',   country: 'Mexico',     code: 'MEX' },
  { id: 'America/Indiana/Indianapolis', city: 'Indianapolis', country: 'USA', code: 'IND' },
  { id: 'America/Detroit',     city: 'Detroit',       country: 'USA',        code: 'DTW' },
  { id: 'America/New_York',    city: 'New York',      country: 'USA',        code: 'NYC' },
  { id: 'America/Toronto',     city: 'Toronto',       country: 'Canada',     code: 'YYZ' },
  { id: 'America/Halifax',     city: 'Halifax',       country: 'Canada',     code: 'YHZ' },
  { id: 'America/St_Johns',    city: 'St. John\'s',   country: 'Canada',     code: 'YYT' },
  { id: 'America/Bogota',      city: 'Bogotá',        country: 'Colombia',   code: 'BOG' },
  { id: 'America/Lima',        city: 'Lima',          country: 'Peru',       code: 'LIM' },
  { id: 'America/Caracas',     city: 'Caracas',       country: 'Venezuela',  code: 'CCS' },
  { id: 'America/Santiago',    city: 'Santiago',      country: 'Chile',      code: 'SCL' },
  { id: 'America/Sao_Paulo',   city: 'São Paulo',     country: 'Brazil',     code: 'GRU' },
  { id: 'America/Argentina/Buenos_Aires', city: 'Buenos Aires', country: 'Argentina', code: 'EZE' },
  // Europe
  { id: 'Atlantic/Reykjavik',  city: 'Reykjavik',     country: 'Iceland',    code: 'RKV' },
  { id: 'Europe/London',       city: 'London',        country: 'UK',         code: 'LDN' },
  { id: 'Europe/Lisbon',       city: 'Lisbon',        country: 'Portugal',   code: 'LIS' },
  { id: 'Europe/Dublin',       city: 'Dublin',        country: 'Ireland',    code: 'DUB' },
  { id: 'Europe/Paris',        city: 'Paris',         country: 'France',     code: 'PAR' },
  { id: 'Europe/Berlin',       city: 'Berlin',        country: 'Germany',    code: 'BER' },
  { id: 'Europe/Amsterdam',    city: 'Amsterdam',     country: 'Netherlands',code: 'AMS' },
  { id: 'Europe/Madrid',       city: 'Madrid',        country: 'Spain',      code: 'MAD' },
  { id: 'Europe/Rome',         city: 'Rome',          country: 'Italy',      code: 'FCO' },
  { id: 'Europe/Stockholm',    city: 'Stockholm',     country: 'Sweden',     code: 'ARN' },
  { id: 'Europe/Warsaw',       city: 'Warsaw',        country: 'Poland',     code: 'WAW' },
  { id: 'Europe/Zurich',       city: 'Zurich',        country: 'Switzerland',code: 'ZRH' },
  { id: 'Europe/Helsinki',     city: 'Helsinki',      country: 'Finland',    code: 'HEL' },
  { id: 'Europe/Kiev',         city: 'Kyiv',          country: 'Ukraine',    code: 'KBP' },
  { id: 'Europe/Bucharest',    city: 'Bucharest',     country: 'Romania',    code: 'OTP' },
  { id: 'Europe/Athens',       city: 'Athens',        country: 'Greece',     code: 'ATH' },
  { id: 'Europe/Moscow',       city: 'Moscow',        country: 'Russia',     code: 'SVO' },
  { id: 'Europe/Istanbul',     city: 'Istanbul',      country: 'Turkey',     code: 'IST' },
  // Africa & Middle East
  { id: 'Africa/Casablanca',   city: 'Casablanca',    country: 'Morocco',    code: 'CMN' },
  { id: 'Africa/Cairo',        city: 'Cairo',         country: 'Egypt',      code: 'CAI' },
  { id: 'Africa/Lagos',        city: 'Lagos',         country: 'Nigeria',    code: 'LOS' },
  { id: 'Africa/Nairobi',      city: 'Nairobi',       country: 'Kenya',      code: 'NBO' },
  { id: 'Africa/Johannesburg', city: 'Johannesburg',  country: 'S. Africa',  code: 'JNB' },
  { id: 'Asia/Jerusalem',      city: 'Tel Aviv',      country: 'Israel',     code: 'TLV' },
  { id: 'Asia/Riyadh',         city: 'Riyadh',        country: 'Saudi Arabia',code: 'RUH' },
  { id: 'Asia/Dubai',          city: 'Dubai',         country: 'UAE',        code: 'DXB' },
  { id: 'Asia/Tehran',         city: 'Tehran',        country: 'Iran',       code: 'IKA' },
  // Asia
  { id: 'Asia/Karachi',        city: 'Karachi',       country: 'Pakistan',   code: 'KHI' },
  { id: 'Asia/Kolkata',        city: 'Mumbai',        country: 'India',      code: 'BOM' },
  { id: 'Asia/Colombo',        city: 'Colombo',       country: 'Sri Lanka',  code: 'CMB' },
  { id: 'Asia/Kathmandu',      city: 'Kathmandu',     country: 'Nepal',      code: 'KTM' },
  { id: 'Asia/Dhaka',          city: 'Dhaka',         country: 'Bangladesh', code: 'DAC' },
  { id: 'Asia/Yangon',         city: 'Yangon',        country: 'Myanmar',    code: 'RGN' },
  { id: 'Asia/Bangkok',        city: 'Bangkok',       country: 'Thailand',   code: 'BKK' },
  { id: 'Asia/Ho_Chi_Minh',    city: 'Ho Chi Minh',   country: 'Vietnam',    code: 'SGN' },
  { id: 'Asia/Jakarta',        city: 'Jakarta',       country: 'Indonesia',  code: 'CGK' },
  { id: 'Asia/Kuala_Lumpur',   city: 'Kuala Lumpur',  country: 'Malaysia',   code: 'KUL' },
  { id: 'Asia/Singapore',      city: 'Singapore',     country: 'Singapore',  code: 'SIN' },
  { id: 'Asia/Manila',         city: 'Manila',        country: 'Philippines',code: 'MNL' },
  { id: 'Asia/Shanghai',       city: 'Shanghai',      country: 'China',      code: 'SHA' },
  { id: 'Asia/Hong_Kong',      city: 'Hong Kong',     country: 'Hong Kong',  code: 'HKG' },
  { id: 'Asia/Taipei',         city: 'Taipei',        country: 'Taiwan',     code: 'TPE' },
  { id: 'Asia/Seoul',          city: 'Seoul',         country: 'S. Korea',   code: 'ICN' },
  { id: 'Asia/Tokyo',          city: 'Tokyo',         country: 'Japan',      code: 'TYO' },
  // Oceania
  { id: 'Australia/Perth',     city: 'Perth',         country: 'Australia',  code: 'PER' },
  { id: 'Australia/Darwin',    city: 'Darwin',        country: 'Australia',  code: 'DRW' },
  { id: 'Australia/Brisbane',  city: 'Brisbane',      country: 'Australia',  code: 'BNE' },
  { id: 'Australia/Adelaide',  city: 'Adelaide',      country: 'Australia',  code: 'ADL' },
  { id: 'Australia/Sydney',    city: 'Sydney',        country: 'Australia',  code: 'SYD' },
  { id: 'Australia/Melbourne', city: 'Melbourne',     country: 'Australia',  code: 'MEL' },
  { id: 'Pacific/Auckland',    city: 'Auckland',      country: 'New Zealand',code: 'AKL' },
  { id: 'Pacific/Fiji',        city: 'Suva',          country: 'Fiji',       code: 'SUV' },
];

const TZ_IDS = new Set(TZ_LIBRARY.map(t => t.id));

// ─── Timezone Utilities ──────────────────────────────────────────────────────

function partsIn(date, tz) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    weekday: 'short', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map(p => [p.type, p.value]));
  let h = parseInt(parts.hour, 10);
  if (h === 24) h = 0;
  return { hour: h, minute: parseInt(parts.minute, 10), weekday: parts.weekday, month: parts.month, day: parts.day };
}

function minutesInTz(date, tz) {
  const p = partsIn(date, tz);
  return p.hour * 60 + p.minute;
}

function findTz(id) {
  return TZ_LIBRARY.find(t => t.id === id)
    || { id, city: id, country: '', code: id.slice(0, 3).toUpperCase() };
}

function formatMinutes(mins) {
  const total = ((mins % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = ((h24 + 11) % 12) + 1;
  return { h24, h12, m, ampm, hh24: String(h24).padStart(2, '0'), mm: String(m).padStart(2, '0') };
}

function loadStored(key, fallback) {
  try {
    const v = localStorage.getItem('meridian:' + key);
    if (v !== null) return JSON.parse(v);
  } catch (_) {}
  return fallback;
}

function saveStored(key, value) {
  try { localStorage.setItem('meridian:' + key, JSON.stringify(value)); } catch (_) {}
}

function defaultAnchorId() {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return TZ_IDS.has(local) ? local : 'America/New_York';
}

// ─── useTimezones Hook ───────────────────────────────────────────────────────

function useTimezones() {
  const [now, setNow] = useState(() => new Date());
  const [anchorId, setAnchorId] = useState(() => loadStored('anchorId', null) || defaultAnchorId());
  const [comparisons, setComparisons] = useState(() =>
    loadStored('comparisons', ['America/Denver', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Asia/Dubai', 'Asia/Kolkata'])
  );
  const [anchorMinutes, setAnchorMinutes] = useState(() => minutesInTz(new Date(), loadStored('anchorId', null) || defaultAnchorId()));
  const [dayOffset, setDayOffset] = useState(0);
  const [followLive, setFollowLive] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (followLive) {
      setAnchorMinutes(minutesInTz(now, anchorId));
      setDayOffset(0);
    }
  }, [now, anchorId, followLive]);

  useEffect(() => { saveStored('anchorId', anchorId); }, [anchorId]);
  useEffect(() => { saveStored('comparisons', comparisons); }, [comparisons]);

  const offsetBetween = useCallback((tzA, tzB) => {
    return minutesInTz(now, tzB) - minutesInTz(now, tzA);
  }, [now]);

  const minutesInCompare = useCallback((tzId) => {
    return anchorMinutes + offsetBetween(anchorId, tzId);
  }, [anchorId, anchorMinutes, offsetBetween]);

  const dayDelta = useCallback((tzId) => {
    const raw = anchorMinutes + offsetBetween(anchorId, tzId);
    if (raw < 0) return -1;
    if (raw >= 1440) return 1;
    return 0;
  }, [anchorId, anchorMinutes, offsetBetween]);

  const scrub = useCallback((mins) => {
    setFollowLive(false);
    const snapped = Math.round(mins / 15) * 15;
    const wrapped = ((snapped % 1440) + 1440) % 1440;
    setAnchorMinutes(prev => {
      const diff = wrapped - prev;
      if (diff > 720) setDayOffset(d => d - 1);
      else if (diff < -720) setDayOffset(d => d + 1);
      return wrapped;
    });
  }, []);

  const toggleAMPM = useCallback(() => {
    setFollowLive(false);
    setAnchorMinutes(prev => {
      const next = (prev + 720) % 1440;
      if (prev >= 720) setDayOffset(d => d + 1);
      return next;
    });
  }, []);

  const goLive = useCallback(() => {
    setFollowLive(true);
    setAnchorMinutes(minutesInTz(new Date(), anchorId));
    setDayOffset(0);
  }, [anchorId]);

  const setAnchor = useCallback((id) => {
    setAnchorId(id);
    setFollowLive(true);
    setAnchorMinutes(minutesInTz(new Date(), id));
    setDayOffset(0);
  }, []);

  const swapAnchor = useCallback((compareId) => {
    setComparisons(prev => prev.map(id => id === compareId ? anchorId : id));
    const newAnchorMins = anchorMinutes + offsetBetween(anchorId, compareId);
    setAnchorId(compareId);
    setAnchorMinutes(((newAnchorMins % 1440) + 1440) % 1440);
  }, [anchorId, anchorMinutes, offsetBetween]);

  const removeComparison = useCallback((id) => {
    setComparisons(prev => prev.filter(c => c !== id));
  }, []);

  return {
    now, anchor: findTz(anchorId), anchorMinutes, dayOffset,
    comparisons: comparisons.map(id => ({
      tz: findTz(id),
      minutes: minutesInCompare(id),
      dayDelta: dayDelta(id) + dayOffset,
      offsetFromAnchor: offsetBetween(anchorId, id),
    })),
    comparisonsIds: comparisons, followLive,
    scrub, toggleAMPM, goLive, setAnchor, swapAnchor, setComparisons, removeComparison,
  };
}

// ─── Card Tint (day/night color) ─────────────────────────────────────────────

function tintFor(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = m / 60;

  const stops = [
    { h: 0,  c: [0.20, 0.02, 265] },
    { h: 5,  c: [0.22, 0.03, 280] },
    { h: 6,  c: [0.40, 0.08, 30]  },
    { h: 8,  c: [0.62, 0.09, 55]  },
    { h: 12, c: [0.80, 0.09, 85]  },
    { h: 15, c: [0.72, 0.10, 65]  },
    { h: 17, c: [0.55, 0.10, 40]  },
    { h: 19, c: [0.38, 0.09, 20]  },
    { h: 21, c: [0.28, 0.05, 295] },
    { h: 24, c: [0.20, 0.02, 265] },
  ];

  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (h >= stops[i].h && h <= stops[i + 1].h) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const span = b.h - a.h || 1;
  const t = (h - a.h) / span;
  const L = a.c[0] + (b.c[0] - a.c[0]) * t;
  const C = a.c[1] + (b.c[1] - a.c[1]) * t;
  const H = a.c[2] + (b.c[2] - a.c[2]) * t;

  const bg  = `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
  const bg2 = `oklch(${(L - 0.06).toFixed(3)} ${C.toFixed(3)} ${(H + 8).toFixed(1)})`;
  const fg  = L > 0.55 ? 'oklch(0.15 0.02 50)' : 'oklch(0.98 0.01 80)';
  const fgDim = L > 0.55 ? 'oklch(0.32 0.03 50)' : 'oklch(0.72 0.02 80)';

  return { bg, bg2, fg, fgDim, L };
}

// ─── TimeCard ────────────────────────────────────────────────────────────────

function TimeCard({ tz, minutes, dayDelta, onSelect, onRemove, isAnchor }) {
  const [hovered, setHovered] = useState(false);
  const t = tintFor(minutes);
  const f = formatMinutes(minutes);
  const workHour = f.h24 >= 9 && f.h24 < 18;

  const phaseIcon = (() => {
    const h = f.h24;
    if (h >= 20 || h < 6) return <MoonIcon size={14} />;
    if (h === 6 || h === 7 || h === 18 || h === 19) return <HorizonIcon size={14} />;
    return <SunIcon size={14} />;
  })();

  const dayLabel = dayDelta === -1 ? 'yesterday' : dayDelta === 1 ? 'tomorrow' : null;

  return (
    <div className="relative w-full"
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}>
    {onRemove && hovered && (
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(tz.id); }}
        className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full flex items-center justify-center"
        style={{
          background: 'oklch(0.15 0.02 50 / 0.7)',
          backdropFilter: 'blur(4px)',
          color: 'oklch(0.85 0.01 80)',
          border: '1px solid oklch(1 0 0 / 0.12)',
        }}
        title="Remove city"
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    )}
    <motion.button
      onClick={(e) => onSelect && onSelect(e)}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="relative overflow-hidden rounded-2xl p-3 text-left w-full"
      style={{
        background: `linear-gradient(155deg, ${t.bg} 0%, ${t.bg2} 100%)`,
        color: t.fg,
        boxShadow: isAnchor
          ? `inset 0 0 0 1.5px oklch(0.92 0.05 80 / 0.8), 0 8px 24px -14px ${t.bg2}`
          : `inset 0 0 0 1px oklch(1 0 0 / 0.06), 0 6px 18px -12px ${t.bg2}`,
        minHeight: 92,
        transition: 'background 400ms ease',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-medium opacity-80 min-w-0"
             style={{ color: t.fgDim }}>
          <span className="shrink-0 opacity-90" style={{ color: t.fg }}>{phaseIcon}</span>
          <span className="truncate">{tz.code}{dayLabel ? ` · ${dayLabel}` : ''}</span>
        </div>
      </div>
      <div className="mt-0.5 font-medium text-[13px] leading-tight truncate">{tz.city}</div>
      <div className="mt-1.5 flex items-baseline gap-1 tabular">
        <span className="font-serif-display text-[30px] leading-none">
          {f.h12}<span style={{ color: t.fgDim }}>:</span>{f.mm}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: t.fgDim }}>{f.ampm}</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="inline-block w-1 h-1 rounded-full"
              style={{ background: workHour ? 'oklch(0.72 0.15 145)' : 'oklch(0.55 0.03 50 / 0.5)' }}/>
        <span className="text-[10px]" style={{ color: t.fgDim }}>
          {workHour ? 'working hours' : (f.h24 >= 18 && f.h24 < 22) ? 'evening'
            : (f.h24 < 6 || f.h24 >= 22) ? 'asleep' : 'early'}
        </span>
      </div>
      {isAnchor && (
        <div className="absolute top-2 right-2 text-[9px] uppercase tracking-[0.18em] font-medium px-1.5 py-0.5 rounded"
             style={{ background: 'oklch(0.15 0.02 50 / 0.35)', color: t.fg }}>anchor</div>
      )}
    </motion.button>
    </div>
  );
}

// ─── TimezonePicker ──────────────────────────────────────────────────────────

function TimezonePicker({
  open, onClose, onSelect, excludeIds = [], title = 'Choose a city',
  variant = 'sheet', anchorRect = null,
}) {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) { setQuery(''); setHighlight(0); }
    else setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const list = TZ_LIBRARY.filter(tz => {
    if (excludeIds.includes(tz.id)) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return tz.city.toLowerCase().includes(q)
        || tz.country.toLowerCase().includes(q)
        || tz.code.toLowerCase().includes(q);
  });

  useEffect(() => { setHighlight(h => Math.min(h, Math.max(0, list.length - 1))); }, [list.length]);

  const pickHighlight = () => { const tz = list[highlight]; if (tz) onSelect(tz.id); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(list.length - 1, h + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(0, h - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); pickHighlight(); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  if (variant === 'popover') {
    const POPOVER_W = 300, POPOVER_H_MAX = 360, MARGIN = 8;
    let style = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    if (anchorRect) {
      const vw = window.innerWidth, vh = window.innerHeight;
      let left = anchorRect.right + MARGIN;
      if (left + POPOVER_W > vw - 12) left = anchorRect.left - POPOVER_W - MARGIN;
      if (left < 12) left = Math.max(12, Math.min(vw - POPOVER_W - 12, anchorRect.left));
      let top = anchorRect.top;
      if (top + POPOVER_H_MAX > vh - 12) top = Math.max(12, vh - POPOVER_H_MAX - 12);
      style = { top: `${top}px`, left: `${left}px`, width: `${POPOVER_W}px` };
    }

    return (
      <AnimatePresence>
        {open && (
          <React.Fragment key="popover">
            <motion.div key="pop-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose} className="fixed inset-0 z-40" style={{ background: 'transparent' }} />
            <motion.div key="pop"
              initial={{ opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-50 rounded-2xl overflow-hidden"
              style={{
                ...style, background: 'var(--bg-raised)', border: '1px solid var(--line)',
                boxShadow: '0 20px 60px -20px rgba(0,0,0,0.8), 0 0 0 1px oklch(1 0 0 / 0.03)',
                maxHeight: POPOVER_H_MAX, display: 'flex', flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 pt-3 pb-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-faint)' }}>
                  <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
                </svg>
                <input ref={inputRef} value={query}
                  onChange={e => { setQuery(e.target.value); setHighlight(0); }} onKeyDown={onKey}
                  placeholder={title === 'Set anchor city' ? 'Change anchor…' : 'Type a city…'}
                  className="flex-1 bg-transparent outline-none text-[14px]" style={{ color: 'var(--fg)' }} />
                <button onClick={onClose} className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ color: 'var(--fg-faint)', border: '1px solid var(--line-soft)' }}>esc</button>
              </div>
              <div className="overflow-y-auto no-scrollbar py-1" style={{ flex: 1 }}>
                {list.slice(0, 40).map((tz, i) => (
                  <button key={tz.id} onMouseEnter={() => setHighlight(i)} onClick={() => onSelect(tz.id)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left"
                    style={{ background: i === highlight ? 'var(--bg-card)' : 'transparent', transition: 'background 60ms ease' }}>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{tz.city}</div>
                      <div className="text-[11px] truncate" style={{ color: 'var(--fg-faint)' }}>{tz.country}</div>
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest shrink-0" style={{ color: 'var(--fg-dim)' }}>{tz.code}</div>
                  </button>
                ))}
                {list.length === 0 && (
                  <div className="px-3 py-6 text-center text-[12px]" style={{ color: 'var(--fg-faint)' }}>No matches</div>
                )}
              </div>
              <div className="px-3 py-1.5 flex items-center gap-3 text-[9.5px] font-mono uppercase tracking-[0.14em]"
                   style={{ borderTop: '1px solid var(--line-soft)', color: 'var(--fg-faint)' }}>
                <span>↑↓ navigate</span><span>⏎ select</span>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    );
  }

  // Mobile sheet
  return (
    <AnimatePresence>
      {open && [
        <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 z-40"
          style={{ background: 'oklch(0 0 0 / 0.55)', backdropFilter: 'blur(4px)' }} />,
        <motion.div key="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="absolute left-0 right-0 bottom-0 z-50 rounded-t-3xl"
          style={{ background: 'var(--bg-raised)', boxShadow: '0 -10px 50px -10px rgba(0,0,0,0.7)',
            maxHeight: '78%', border: '1px solid var(--line)' }}>
          <div className="px-5 pt-3 pb-2">
            <div className="mx-auto w-10 h-1 rounded-full" style={{ background: 'var(--line)' }}/>
          </div>
          <div className="px-5 pb-2 flex items-center justify-between">
            <div className="font-serif-display text-2xl">{title}</div>
            <button onClick={onClose} className="text-xs font-mono uppercase tracking-widest px-2 py-1 rounded"
              style={{ color: 'var(--fg-dim)' }}>close</button>
          </div>
          <div className="px-5 pb-3">
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search city, country..."
              className="w-full rounded-xl px-4 py-3 text-[15px] outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', color: 'var(--fg)' }} />
          </div>
          <div className="overflow-y-auto no-scrollbar pb-8" style={{ maxHeight: '50vh' }}>
            {list.map(tz => (
              <button key={tz.id} onClick={() => onSelect(tz.id)}
                className="w-full px-5 py-3 flex items-center justify-between text-left transition-colors"
                style={{ borderTop: '1px solid var(--line-soft)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <div className="text-[15px] font-medium">{tz.city}</div>
                  <div className="text-[12px]" style={{ color: 'var(--fg-faint)' }}>{tz.country}</div>
                </div>
                <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: 'var(--fg-dim)' }}>{tz.code}</div>
              </button>
            ))}
            {list.length === 0 && (
              <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--fg-faint)' }}>No matches.</div>
            )}
          </div>
        </motion.div>
      ]}
    </AnimatePresence>
  );
}

// ─── SemicircleControl (mobile 12h arc) ──────────────────────────────────────

function SemicircleControl({ anchorMinutes, onScrub, anchor, anchorFmt, onAnchorClick, dayOffset, anchorDateStr, maxW }) {
  const W = 340, H = 230;
  const maxWidth = maxW ?? W;
  const CX = W / 2, CY = H - 18;
  const R = 122, HANDLE = 44, R_H = R + HANDLE / 2;

  const BASE = 6 * 60;
  const t = ((anchorMinutes - BASE + 1440) % 1440) / 1440;
  const theta = Math.PI * (1 - t);
  const isDay = t < 0.5;

  const hx = CX + R_H * Math.cos(theta);
  const hy = CY - R_H * Math.sin(theta);
  const [pos, setPos] = useState({ x: hx, y: hy });
  useEffect(() => { setPos({ x: hx, y: hy }); }, [hx, hy]);

  const rootRef = useRef(null);
  const dragRef = useRef(false);
  const downPtRef = useRef({ x: 0, y: 0 });

  const projectPointer = (clientX, clientY) => {
    const rect = rootRef.current.getBoundingClientRect();
    const px = (clientX - rect.left) * (W / rect.width);
    const py = (clientY - rect.top) * (H / rect.height);
    let angle = Math.atan2(CY - py, px - CX);
    if (angle < 0) angle = (px - CX) > 0 ? 0 : Math.PI;
    if (angle > Math.PI) angle = Math.PI;
    setPos({ x: CX + R_H * Math.cos(angle), y: CY - R_H * Math.sin(angle) });
    const newT = 1 - angle / Math.PI;
    onScrub((BASE + Math.round(newT * 1440)) % 1440);
    dragRef.current = true;
  };

  const onDown = (e) => {
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    downPtRef.current = { x: pt.clientX, y: pt.clientY };
    dragRef.current = false;
    const move = (ev) => {
      const p = ev.touches ? ev.touches[0] : ev;
      if (!dragRef.current && (Math.abs(p.clientX - downPtRef.current.x) > 3 || Math.abs(p.clientY - downPtRef.current.y) > 3))
        dragRef.current = true;
      if (dragRef.current) projectPointer(p.clientX, p.clientY);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  };

  const ticks = [];
  for (let i = 0; i <= 24; i++) {
    const ang = Math.PI - (i / 24) * Math.PI;
    const major = i % 6 === 0, mid = i % 3 === 0;
    const inset = major ? 13 : mid ? 8 : 5;
    ticks.push({
      x1: CX + (R - inset) * Math.cos(ang), y1: CY - (R - inset) * Math.sin(ang),
      x2: CX + R * Math.cos(ang), y2: CY - R * Math.sin(ang), major, mid,
    });
  }

  const majorLabels = ['6a', '12p', '6p', '12a', '6a'];
  const leftX = CX - R, rightX = CX + R;
  const arcPath = `M ${leftX} ${CY} A ${R} ${R} 0 0 1 ${rightX} ${CY}`;

  const progressPath = (() => {
    if (t <= 0.001) return '';
    const endX = CX + R * Math.cos(theta);
    const endY = CY - R * Math.sin(theta);
    return `M ${leftX} ${CY} A ${R} ${R} 0 0 1 ${endX} ${endY}`;
  })();

  const leftPct = (pos.x / W) * 100;
  const topPct = (pos.y / H) * 100;
  const timeColor = isDay ? 'var(--accent)' : 'oklch(0.88 0.04 270)';

  return (
    <div ref={rootRef} className="relative w-full select-none"
      style={{ maxWidth: maxWidth, aspectRatio: `${W} / ${H}`, margin: '0 auto', touchAction: 'none' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id="arcGrad24" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="oklch(0.78 0.12 65)"  stopOpacity="0.5"/>
            <stop offset="25%"  stopColor="oklch(0.88 0.14 82)"  stopOpacity="1"/>
            <stop offset="50%"  stopColor="oklch(0.72 0.10 270)" stopOpacity="0.9"/>
            <stop offset="75%"  stopColor="oklch(0.45 0.08 270)" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="oklch(0.60 0.10 280)" stopOpacity="0.5"/>
          </linearGradient>
          <radialGradient id="handleGlow24" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%"  stopColor={isDay ? 'oklch(0.85 0.14 78)' : 'oklch(0.72 0.10 265)'} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={isDay ? 'oklch(0.85 0.14 78)' : 'oklch(0.72 0.10 265)'} stopOpacity="0"/>
          </radialGradient>
        </defs>
        <line x1={CX - R - 16} y1={CY} x2={CX + R + 16} y2={CY} stroke="var(--line-soft)" strokeWidth="1" strokeDasharray="2 5"/>
        {ticks.map((tk, i) => (
          <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
            stroke={tk.major ? 'var(--fg-dim)' : 'var(--line)'}
            strokeWidth={tk.major ? 1.4 : tk.mid ? 1 : 0.7}
            opacity={tk.major ? 0.85 : tk.mid ? 0.45 : 0.25} strokeLinecap="round"/>
        ))}
        {[0, 6, 12, 18, 24].map((i, li) => {
          const ang = Math.PI - (i / 24) * Math.PI;
          const lr = R + 18;
          return (
            <text key={i} x={CX + lr * Math.cos(ang)} y={CY - lr * Math.sin(ang) + 4}
              textAnchor="middle" fill="var(--fg-faint)"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 0.5 }}>
              {majorLabels[li]}
            </text>
          );
        })}
        <path d={arcPath} fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round"/>
        {progressPath && <path d={progressPath} fill="none" stroke="url(#arcGrad24)" strokeWidth="3" strokeLinecap="round"/>}
        <circle cx={pos.x} cy={pos.y} r={44} fill="url(#handleGlow24)"/>
      </svg>

      <div style={{
        position: 'absolute', left: '50%', top: `${((CY - R * 0.52) / H) * 100}%`,
        transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', width: '70%',
      }}>
        <div className="tabular flex items-baseline justify-center gap-1" style={{ lineHeight: 1 }}>
          <span className="font-serif-display" style={{ fontSize: 62, color: timeColor, lineHeight: 1 }}>
            {anchorFmt.h12}<span style={{ color: 'var(--fg-faint)' }}>:</span>{anchorFmt.mm}
          </span>
          <span className="font-mono uppercase tracking-[0.18em]" style={{ fontSize: 13, color: 'var(--fg-dim)', paddingBottom: 6 }}>
            {anchorFmt.ampm}
          </span>
        </div>
        {anchorDateStr && (
          <div className="font-mono tabular" style={{
            fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: dayOffset !== 0 ? 'var(--accent)' : 'var(--fg-faint)', marginTop: 2,
          }}>
            {anchorDateStr}
            {dayOffset !== 0 && <span style={{ marginLeft: 6 }}>{dayOffset > 0 ? `+${dayOffset}d` : `${dayOffset}d`}</span>}
          </div>
        )}
      </div>

      <button onClick={onAnchorClick} style={{
        position: 'absolute', left: '50%', top: `${((CY + 28) / H) * 100}%`, transform: 'translate(-50%, 0)',
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999,
        background: 'var(--bg-card)', border: '1px solid var(--line)', color: 'var(--fg)',
        cursor: 'pointer', whiteSpace: 'nowrap', pointerEvents: 'auto',
      }}>
        <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{anchor?.city}</span>
        <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-faint)' }}>{anchor?.code}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-faint)' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      <button aria-label="Scrub time" onPointerDown={onDown} style={{
        position: 'absolute', left: `${leftPct}%`, top: `${topPct}%`,
        marginLeft: -HANDLE / 2, marginTop: -HANDLE / 2, width: HANDLE, height: HANDLE,
        borderRadius: '50%',
        background: isDay
          ? 'radial-gradient(circle at 32% 32%, oklch(0.94 0.10 88), oklch(0.74 0.14 62))'
          : 'radial-gradient(circle at 32% 32%, oklch(0.84 0.08 268), oklch(0.58 0.08 272))',
        color: isDay ? '#2a1a06' : '#0c0c18',
        boxShadow: isDay
          ? '0 0 0 1.5px oklch(0.52 0.10 62), 0 8px 24px -8px oklch(0.76 0.14 62 / 0.8), inset 0 1px 0 oklch(0.98 0.08 88 / 0.7)'
          : '0 0 0 1.5px oklch(0.38 0.08 272), 0 8px 24px -8px oklch(0.56 0.10 270 / 0.7), inset 0 1px 0 oklch(0.92 0.07 268 / 0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        touchAction: 'none', cursor: 'grab', border: 'none', padding: 0, pointerEvents: 'auto',
        transition: 'transform 80ms ease, box-shadow 80ms ease',
      }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.91)'}
        onMouseUp={e => e.currentTarget.style.transform = ''}
        onMouseLeave={e => e.currentTarget.style.transform = ''}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.91)'}
        onTouchEnd={e => e.currentTarget.style.transform = ''}
      >
        {isDay ? <SunIcon size={22}/> : <MoonIcon size={22}/>}
      </button>
    </div>
  );
}

// ─── CircleControl (desktop 24h dial) ────────────────────────────────────────

function CircleControl({ anchorMinutes, onScrub, onToggleAMPM }) {
  const W = 300, H = 300, CX = W / 2, CY = H / 2, R = 120, HANDLE = 52;
  const R_H = R + HANDLE / 2;

  const minutesToAngle = (mins) => Math.PI / 2 - 2 * Math.PI * (((mins % 1440) + 1440) % 1440 / 1440);
  const angleToMinutes = (angle) => {
    let f = (Math.PI / 2 - angle) / (2 * Math.PI);
    f = ((f % 1) + 1) % 1;
    return Math.round(f * 1440);
  };

  const theta = minutesToAngle(anchorMinutes);
  const hx = CX + R_H * Math.cos(theta);
  const hy = CY - R_H * Math.sin(theta);
  const [pos, setPos] = useState({ x: hx, y: hy });
  useEffect(() => { setPos({ x: hx, y: hy }); }, [hx, hy]);

  const dragFlagRef = useRef(false);
  const rootRef = useRef(null);
  const isNight = anchorMinutes < 6 * 60 || anchorMinutes >= 18 * 60;

  const projectPointer = (clientX, clientY) => {
    const rect = rootRef.current.getBoundingClientRect();
    const px = (clientX - rect.left) * (W / rect.width);
    const py = (clientY - rect.top) * (H / rect.height);
    const angle = Math.atan2(CY - py, px - CX);
    setPos({ x: CX + R_H * Math.cos(angle), y: CY - R_H * Math.sin(angle) });
    onScrub(angleToMinutes(angle));
    dragFlagRef.current = true;
  };

  const ticks = [];
  for (let i = 0; i < 24; i++) {
    const ang = minutesToAngle(i * 60);
    const major = i % 6 === 0, medium = i % 3 === 0;
    const inner = R - (major ? 14 : medium ? 10 : 6);
    ticks.push({
      x1: CX + inner * Math.cos(ang), y1: CY - inner * Math.sin(ang),
      x2: CX + R * Math.cos(ang), y2: CY - R * Math.sin(ang), major, medium,
    });
  }

  const majorLabels = { 0: '12a', 6: '6a', 12: '12p', 18: '6p' };
  const pointAt = (mins) => { const a = minutesToAngle(mins); return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) }; };
  const p6a = pointAt(6 * 60), p6p = pointAt(18 * 60), p0 = pointAt(0);
  const dayPath = `M ${p6a.x} ${p6a.y} A ${R} ${R} 0 0 1 ${p6p.x} ${p6p.y}`;
  const nightPath = `M ${p6p.x} ${p6p.y} A ${R} ${R} 0 0 1 ${p6a.x} ${p6a.y}`;
  const progressLarge = anchorMinutes > 720 ? 1 : 0;
  const arcEnd = pointAt(anchorMinutes);
  const progressPath = anchorMinutes > 0
    ? `M ${p0.x} ${p0.y} A ${R} ${R} 0 ${progressLarge} 1 ${arcEnd.x} ${arcEnd.y}` : '';

  const onDown = (e) => {
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    const down = { x: pt.clientX, y: pt.clientY };
    dragFlagRef.current = false;
    const move = (ev) => {
      const p = ev.touches ? ev.touches[0] : ev;
      if (!dragFlagRef.current && (Math.abs(p.clientX - down.x) > 3 || Math.abs(p.clientY - down.y) > 3))
        dragFlagRef.current = true;
      if (dragFlagRef.current) projectPointer(p.clientX, p.clientY);
    };
    const up = () => {
      if (!dragFlagRef.current) onToggleAMPM();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  };

  const leftPct = (pos.x / W) * 100, topPct = (pos.y / H) * 100;

  return (
    <div ref={rootRef} className="relative mx-auto select-none"
      style={{ width: W, maxWidth: '84vw', aspectRatio: '1 / 1', touchAction: 'none' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="cDay" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="oklch(0.88 0.14 85)" stopOpacity="0.95"/>
            <stop offset="1" stopColor="oklch(0.78 0.10 55)" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="cNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.72 0.10 265)" stopOpacity="0.9"/>
            <stop offset="1" stopColor="oklch(0.55 0.09 290)" stopOpacity="0.3"/>
          </linearGradient>
          <radialGradient id="cCenter" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={isNight ? 'oklch(0.32 0.04 265)' : 'oklch(0.42 0.05 70)'} stopOpacity="0.5"/>
            <stop offset="1" stopColor={isNight ? 'oklch(0.32 0.04 265)' : 'oklch(0.42 0.05 70)'} stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="cGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={isNight ? 'oklch(0.72 0.10 265)' : 'oklch(0.85 0.14 78)'} stopOpacity="0.4"/>
            <stop offset="1" stopColor={isNight ? 'oklch(0.72 0.10 265)' : 'oklch(0.85 0.14 78)'} stopOpacity="0"/>
          </radialGradient>
        </defs>
        <circle cx={CX} cy={CY} r={R - 14} fill="url(#cCenter)" />
        <path d={dayPath} fill="none" stroke="url(#cDay)" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
        <path d={nightPath} fill="none" stroke="url(#cNight)" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
        {ticks.map((tk, idx) => (
          <line key={idx} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
            stroke={tk.major ? 'var(--fg-dim)' : 'var(--line)'}
            strokeWidth={tk.major ? 1.4 : (tk.medium ? 1 : 0.8)}
            opacity={tk.major ? 0.9 : (tk.medium ? 0.5 : 0.3)} strokeLinecap="round"/>
        ))}
        {Object.entries(majorLabels).map(([i, lbl]) => {
          const ang = minutesToAngle(Number(i) * 60);
          const lr = R + 20;
          return (
            <text key={i} x={CX + lr * Math.cos(ang)} y={CY - lr * Math.sin(ang) + 3}
              textAnchor="middle" fill="var(--fg-faint)"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 0.5 }}>{lbl}</text>
          );
        })}
        {progressPath && (
          <path d={progressPath} fill="none"
            stroke={isNight ? 'oklch(0.72 0.10 265)' : 'oklch(0.85 0.14 78)'}
            strokeWidth="3" strokeLinecap="round" opacity="0.85"/>
        )}
        <circle cx={pos.x} cy={pos.y} r={46} fill="url(#cGlow)" />
        <circle cx={CX} cy={CY} r={2.5} fill="var(--fg-faint)" />
      </svg>

      <motion.button aria-label={isNight ? 'Nighttime — tap to flip to daytime' : 'Daytime — tap to flip to nighttime'}
        onPointerDown={onDown} whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          position: 'absolute', left: `${leftPct}%`, top: `${topPct}%`,
          width: HANDLE, height: HANDLE, transform: 'translate(-50%, -50%)', borderRadius: '50%',
          background: isNight
            ? 'radial-gradient(circle at 30% 30%, oklch(0.82 0.08 265), oklch(0.58 0.08 270))'
            : 'radial-gradient(circle at 30% 30%, oklch(0.93 0.10 85), oklch(0.72 0.14 60))',
          color: isNight ? '#0d0d16' : '#2a1a06',
          boxShadow: isNight
            ? '0 0 0 1px oklch(0.40 0.08 270), 0 10px 28px -10px oklch(0.55 0.10 270 / 0.7), inset 0 1px 0 oklch(0.95 0.08 265 / 0.7)'
            : '0 0 0 1px oklch(0.50 0.10 60), 0 10px 28px -10px oklch(0.75 0.14 60 / 0.8), inset 0 1px 0 oklch(0.98 0.10 85 / 0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          touchAction: 'none', cursor: 'grab', border: 'none', padding: 0,
        }}>
        <div style={{ display: 'flex' }}>
          {isNight ? <MoonIcon size={24}/> : <SunIcon size={24}/>}
        </div>
      </motion.button>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

function TimezonePlannerApp() {
  const tz = useTimezones();

  const [picker, setPicker] = useState(null);
  const openPicker = (p, evt) => {
    let rect = null;
    if (evt?.currentTarget?.getBoundingClientRect) {
      const r = evt.currentTarget.getBoundingClientRect();
      rect = { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    }
    setPicker({ ...p, rect });
  };
  const closePicker = () => setPicker(null);
  const pickerTitle = picker?.kind === 'anchor' ? 'Set anchor city'
                    : picker?.kind === 'add' ? 'Add a city' : 'Swap this city';
  const pickerExcludes = (() => {
    if (!picker) return [];
    if (picker.kind === 'anchor' || picker.kind === 'add') return [tz.anchor.id, ...tz.comparisonsIds];
    return [tz.anchor.id, ...tz.comparisonsIds.filter(id => id !== picker.slot)];
  })();
  const handlePickerSelect = (newId) => {
    if (!picker) return;
    if (picker.kind === 'anchor') tz.setAnchor(newId);
    else if (picker.kind === 'add') tz.setComparisons(prev => [...prev, newId]);
    else tz.setComparisons(prev => prev.map(id => id === picker.slot ? newId : id));
    setPicker(null);
  };

  const anchorFmt = formatMinutes(tz.anchorMinutes);
  const anchorDate = useMemo(() => {
    const d = new Date(tz.now);
    d.setDate(d.getDate() + tz.dayOffset);
    return d;
  }, [tz.now, tz.dayOffset]);

  const [copied, setCopied] = useState(false);
  const copyTimes = useCallback(() => {
    const shortDate = new Intl.DateTimeFormat('en-US', {
      timeZone: tz.anchor.id, weekday: 'short', month: 'short', day: 'numeric',
    }).format(anchorDate).replace(',', '');

    const fmtEntry = (code, mins, delta) => {
      const f = formatMinutes(mins);
      const time = `${f.h12}:${f.mm}${f.ampm === 'AM' ? 'a' : 'p'}`;
      const offset = delta !== 0 ? ` ${delta > 0 ? '+' : ''}${delta}` : '';
      return `${code} ${time}${offset}`;
    };

    const text = [shortDate, fmtEntry(tz.anchor.code, tz.anchorMinutes, tz.dayOffset),
      ...tz.comparisons.map(c => fmtEntry(c.tz.code, c.minutes, c.dayDelta))].join(' · ');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [tz, anchorDate]);

  const isPM = tz.anchorMinutes < 6 * 60 || tz.anchorMinutes >= 18 * 60;

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 960px)').matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const anchorDateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: tz.anchor.id, weekday: 'long', month: 'long', day: 'numeric',
  }).format(anchorDate);

  const anchorTimeColor = isPM ? 'oklch(0.88 0.04 270)' : 'var(--accent)';

  // ── Reusable pieces ──

  const LiveBadge = (
    <div className="flex items-center gap-2">
      <button onClick={tz.goLive}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-medium"
        style={{
          background: tz.followLive ? 'oklch(0.72 0.15 145 / 0.14)' : 'var(--bg-card)',
          color: tz.followLive ? 'oklch(0.82 0.15 145)' : 'var(--fg-dim)',
          border: `1px solid ${tz.followLive ? 'oklch(0.50 0.15 145 / 0.4)' : 'var(--line)'}`,
        }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{
          background: tz.followLive ? 'oklch(0.72 0.15 145)' : 'var(--fg-faint)',
          animation: tz.followLive ? 'pulse-dot 1.6s ease-in-out infinite' : 'none',
        }}/>
        <span>{tz.followLive ? 'Live' : 'Jump to now'}</span>
      </button>
      <button onClick={copyTimes} title="Copy all times"
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: copied ? 'oklch(0.72 0.15 145 / 0.14)' : 'transparent',
          border: `1px solid ${copied ? 'oklch(0.50 0.15 145 / 0.4)' : 'var(--line)'}`,
          color: copied ? 'oklch(0.82 0.15 145)' : 'var(--fg-faint)',
          transition: 'all 200ms ease',
        }}>
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        )}
      </button>
    </div>
  );

  const AnchorDisplay = (
    <button onClick={(e) => openPicker({ kind: 'anchor' }, e)} className="w-full text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
           style={{ background: 'var(--bg-card)', border: '1px solid var(--line)' }}>
        <span className={`${isDesktop ? 'text-[22px]' : 'text-[18px]'} font-medium tracking-tight leading-none`}>{tz.anchor.city}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--fg-faint)' }}>{tz.anchor.code}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-faint)' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      <div className="mt-2 flex items-baseline justify-center gap-2 tabular">
        <span className={`font-serif-display leading-[0.9] ${isDesktop ? 'text-[128px]' : 'text-[80px]'}`}
              style={{ color: anchorTimeColor }}>
          {anchorFmt.h12}<span style={{ color: 'var(--fg-faint)' }}>:</span>{anchorFmt.mm}
        </span>
        <span className={`font-mono uppercase tracking-[0.2em] ${isDesktop ? 'text-[16px] pb-4' : 'text-[13px] pb-2.5'}`}
              style={{ color: 'var(--fg-dim)' }}>{anchorFmt.ampm}</span>
      </div>
      <div className={`${isDesktop ? 'text-[13px]' : 'text-[12px]'} tabular`}
           style={{ color: tz.dayOffset !== 0 ? 'var(--accent)' : 'var(--fg-faint)' }}>
        {anchorDateStr}
        {tz.dayOffset !== 0 && (
          <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
            {tz.dayOffset > 0 ? `+${tz.dayOffset}d` : `${tz.dayOffset}d`}
          </span>
        )}
      </div>
    </button>
  );

  const AddBtn = (
    <button onClick={(e) => openPicker({ kind: 'add' }, e)}
      className="rounded-2xl p-3 flex items-center justify-center gap-1.5 min-h-[76px] w-full"
      style={{ background: 'transparent', border: '1.5px dashed var(--line)', color: 'var(--fg-faint)' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      <span className="text-[12px]">Add city</span>
    </button>
  );

  // ── DESKTOP ──
  if (isDesktop) {
    const normalized = tz.comparisons.map(c => {
      let off = c.offsetFromAnchor;
      if (off > 720) off -= 1440;
      if (off <= -720) off += 1440;
      return { ...c, normOff: off };
    });
    const westComps = normalized.filter(c => c.normOff < 0).sort((a, b) => a.normOff - b.normOff);
    const eastComps = normalized.filter(c => c.normOff >= 0).sort((a, b) => a.normOff - b.normOff);

    const sideCard = (c) => (
      <TimeCard key={c.tz.id} tz={c.tz} minutes={c.minutes} dayDelta={c.dayDelta}
        onSelect={(e) => openPicker({ kind: 'slot', slot: c.tz.id }, e)} onRemove={tz.removeComparison} />
    );

    return (
      <div className="relative mx-auto w-full" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="grain absolute inset-0 pointer-events-none" />
        <header className="px-8 pt-6 pb-4 flex items-center justify-between relative z-10 max-w-[1400px] mx-auto">
          <div>
            <div className="font-serif-display text-[32px] leading-none italic">Meridian</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] mt-1.5" style={{ color: 'var(--fg-faint)' }}>timezone planner</div>
          </div>
          {LiveBadge}
        </header>
        <div className="max-w-[1400px] mx-auto px-8 pb-16 pt-4 relative z-10">
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr minmax(460px, 540px) 1fr' }}>
            <div className="flex flex-col gap-3">{westComps.map(sideCard)}{AddBtn}</div>
            <div className="flex flex-col items-stretch gap-2">
              <SemicircleControl anchorMinutes={tz.anchorMinutes} onScrub={tz.scrub} anchor={tz.anchor}
                anchorFmt={anchorFmt} onAnchorClick={(e) => openPicker({ kind: 'anchor' }, e)}
                dayOffset={tz.dayOffset} anchorDateStr={anchorDateStr} maxW={500} />
            </div>
            <div className="flex flex-col gap-3">{eastComps.map(sideCard)}{AddBtn}</div>
          </div>
        </div>
        <TimezonePicker open={picker !== null} variant="popover" anchorRect={picker?.rect}
          onClose={closePicker} title={pickerTitle} excludeIds={pickerExcludes} onSelect={handlePickerSelect} />
      </div>
    );
  }

  // ── MOBILE ──
  return (
    <div className="relative mx-auto" style={{ maxWidth: 440, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="grain absolute inset-0 pointer-events-none" />
      <header className="px-5 pt-6 pb-2 flex items-center justify-between relative z-10">
        <div>
          <div className="font-serif-display text-[28px] leading-none italic">Meridian</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] mt-1.5" style={{ color: 'var(--fg-faint)' }}>timezone planner</div>
        </div>
        {LiveBadge}
      </header>
      <section className="px-4 pt-2 pb-10 relative z-10">
        <SemicircleControl anchorMinutes={tz.anchorMinutes} onScrub={tz.scrub} anchor={tz.anchor}
          anchorFmt={anchorFmt} onAnchorClick={(e) => openPicker({ kind: 'anchor' }, e)}
          dayOffset={tz.dayOffset} anchorDateStr={anchorDateStr} />
      </section>
      <div className="mx-5 mt-4 mb-3 flex items-center gap-3 relative z-10">
        <div className="flex-1 h-px" style={{ background: 'var(--line-soft)' }}/>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--fg-faint)' }}>elsewhere</div>
        <div className="flex-1 h-px" style={{ background: 'var(--line-soft)' }}/>
      </div>
      <section className="px-4 pb-28 relative z-10">
        <div className="grid gap-2 grid-cols-2">
          {tz.comparisons.map((c) => (
            <TimeCard key={c.tz.id} tz={c.tz} minutes={c.minutes} dayDelta={c.dayDelta}
              onSelect={(e) => openPicker({ kind: 'slot', slot: c.tz.id }, e)} onRemove={tz.removeComparison} />
          ))}
          {AddBtn}
        </div>
      </section>
      <TimezonePicker open={picker !== null} variant="sheet" onClose={closePicker}
        title={pickerTitle} excludeIds={pickerExcludes} onSelect={handlePickerSelect} />
      <footer className="pb-8 pt-2 text-center relative z-10">
        <a href="https://samirhusain.info" target="_blank" rel="noopener noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--fg-faint)' }}>
          developed by samir husain
        </a>
      </footer>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TimezonePlannerApp />);
