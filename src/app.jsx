// Fallback copy for non-secure contexts (HTTP on local network, etc.)
function execCopy(text, onSuccess) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
  document.body.appendChild(el);
  el.focus();
  el.select();
  try {
    if (document.execCommand('copy')) onSuccess();
  } catch (_) {}
  document.body.removeChild(el);
}

// Main app — wires the hook, semicircle, anchor display, grid, and picker.

function TimezonePlannerApp() {
  const tz = useTimezones();
  const { motion, AnimatePresence } = Motion;

  // Picker state: { kind: 'anchor' | 'slot' | 'add', slot?: string, rect?: DOMRect } | null
  const [picker, setPicker] = React.useState(null);
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
                    : picker?.kind === 'add' ? 'Add a city'
                    : 'Swap this city';
  const pickerExcludes = (() => {
    if (!picker) return [];
    if (picker.kind === 'anchor') return [tz.anchor.id, ...tz.comparisonsIds];
    if (picker.kind === 'add') return [tz.anchor.id, ...tz.comparisonsIds];
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

  // Compute anchor date including dayOffset from scrubbing (needed by copyTimes)
  const anchorDate = React.useMemo(() => {
    const d = new Date(tz.now);
    d.setDate(d.getDate() + tz.dayOffset);
    return d;
  }, [tz.now, tz.dayOffset]);

  // ── Copy all times (compact format) ──────────────────────────────────────
  const [copied, setCopied] = React.useState(false);

  const copyTimes = React.useCallback(() => {
    // Short date from anchor tz: "Fri Apr 18"
    const shortDate = new Intl.DateTimeFormat('en-US', {
      timeZone: tz.anchor.id, weekday: 'short', month: 'short', day: 'numeric',
    }).format(anchorDate).replace(',', '');

    const fmtEntry = (code, mins, delta) => {
      const f = formatMinutes(mins);
      const time = `${f.h12}:${f.mm}${f.ampm === 'AM' ? 'a' : 'p'}`;
      const offset = delta !== 0 ? ` ${delta > 0 ? '+' : ''}${delta}` : '';
      return `${code} ${time}${offset}`;
    };

    const anchorEntry = fmtEntry(tz.anchor.code, tz.anchorMinutes, tz.dayOffset);
    const compEntries = tz.comparisons.map(c => fmtEntry(c.tz.code, c.minutes, c.dayDelta));

    const text = [shortDate, anchorEntry, ...compEntries].join(' · ');

    const onSuccess = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    // navigator.clipboard requires HTTPS — fall back to execCommand for HTTP/local.
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => execCopy(text, onSuccess));
    } else {
      execCopy(text, onSuccess);
    }
  }, [tz, anchorDate]);

  const isPM = tz.anchorMinutes < 6 * 60 || tz.anchorMinutes >= 18 * 60;

  // Responsive: detect desktop viewport
  const [isDesktop, setIsDesktop] = React.useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 960px)').matches : false
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const anchorDateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: tz.anchor.id, weekday: 'long', month: 'long', day: 'numeric',
  }).format(anchorDate);

  // ---------- Reusable pieces ----------

  const LiveBadge = (
    <div className="flex items-center gap-2">
      <button
        onClick={tz.goLive}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-medium"
        style={{
          background: tz.followLive ? 'oklch(0.72 0.15 145 / 0.14)' : 'var(--bg-card)',
          color: tz.followLive ? 'oklch(0.82 0.15 145)' : 'var(--fg-dim)',
          border: `1px solid ${tz.followLive ? 'oklch(0.50 0.15 145 / 0.4)' : 'var(--line)'}`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: tz.followLive ? 'oklch(0.72 0.15 145)' : 'var(--fg-faint)',
            animation: tz.followLive ? 'pulse-dot 1.6s ease-in-out infinite' : 'none',
          }}
        />
        <span>{tz.followLive ? 'Live' : 'Jump to now'}</span>
      </button>
      <button
        onClick={copyTimes}
        title="Copy all times"
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: copied ? 'oklch(0.72 0.15 145 / 0.14)' : 'transparent',
          border: `1px solid ${copied ? 'oklch(0.50 0.15 145 / 0.4)' : 'var(--line)'}`,
          color: copied ? 'oklch(0.82 0.15 145)' : 'var(--fg-faint)',
          transition: 'all 200ms ease',
        }}
      >
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

  const DialMobile = (
    <SemicircleControl
      anchorMinutes={tz.anchorMinutes}
      onScrub={tz.scrub}
      anchor={tz.anchor}
      anchorFmt={anchorFmt}
      onAnchorClick={(e) => openPicker({ kind: 'anchor' }, e)}
      dayOffset={tz.dayOffset}
      anchorDateStr={anchorDateStr}
    />
  );
  const DialDesktop = (
    <CircleControl
      anchorMinutes={tz.anchorMinutes}
      onScrub={tz.scrub}
      onToggleAMPM={tz.toggleAMPM}
    />
  );

  // Solid color for the big numerals — picks a day/night tone but AVOIDS
  // background-clip:text (which was fragile & caused "block" rendering glitch
  // at certain scrub positions).
  const anchorTimeColor = isPM ? 'oklch(0.88 0.04 270)' : 'var(--accent)';

  const AnchorDisplay = (
    <button
      onClick={(e) => openPicker({ kind: 'anchor' }, e)}
      className="w-full text-center"
    >
      {/* City — styled as a clear interactive pill so it's obvious it's tappable */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
           style={{
             background: 'var(--bg-card)',
             border: '1px solid var(--line)',
           }}>
        <span className={`${isDesktop ? 'text-[22px]' : 'text-[18px]'} font-medium tracking-tight leading-none`}>
          {tz.anchor.city}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--fg-faint)' }}>{tz.anchor.code}</span>
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

  // ---------- DESKTOP LAYOUT ----------
  if (isDesktop) {
    // Split comparison cards by offset: west (negative) vs east (positive) of anchor.
    // Normalize offsets to (-12h..+12h] for intuitive east/west split.
    const normalized = tz.comparisons.map(c => {
      let off = c.offsetFromAnchor;
      if (off > 720) off -= 1440;
      if (off <= -720) off += 1440;
      return { ...c, normOff: off };
    });
    const westComps = normalized
      .filter(c => c.normOff < 0)
      .sort((a, b) => a.normOff - b.normOff); // furthest west at top
    const eastComps = normalized
      .filter(c => c.normOff >= 0)
      .sort((a, b) => a.normOff - b.normOff); // closest east at top

    const sideCard = (c) => (
      <TimeCard
        key={c.tz.id}
        tz={c.tz}
        minutes={c.minutes}
        dayDelta={c.dayDelta}
        onSelect={(e) => openPicker({ kind: 'slot', slot: c.tz.id }, e)}
        onRemove={tz.removeComparison}
      />
    );

    const AddBtn = (
      <button
        onClick={(e) => openPicker({ kind: 'add' }, e)}
        className="rounded-2xl p-3 flex items-center justify-center gap-1.5 min-h-[76px] w-full"
        style={{
          background: 'transparent',
          border: '1.5px dashed var(--line)',
          color: 'var(--fg-faint)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        <span className="text-[12px]">Add city</span>
      </button>
    );

    return (
      <div className="relative mx-auto w-full" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="grain absolute inset-0 pointer-events-none" />

        {/* Header bar */}
        <header className="px-8 pt-6 pb-4 flex items-center justify-between relative z-10 max-w-[1400px] mx-auto">
          <div>
            <div className="font-serif-display text-[32px] leading-none italic">Meridian</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] mt-1.5"
                 style={{ color: 'var(--fg-faint)' }}>
              timezone planner
            </div>
          </div>
          {LiveBadge}
        </header>

        {/* 3-column layout: left cards | clock | right cards */}
        <div className="max-w-[1400px] mx-auto px-8 pb-16 pt-4 relative z-10">
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr minmax(460px, 540px) 1fr' }}>
            {/* Left column */}
            <div className="flex flex-col gap-3">
              {westComps.map(sideCard)}
              {AddBtn}
            </div>

            {/* Center: clock stack */}
            <div className="flex flex-col items-stretch gap-2">
              <div>{DialDesktop}</div>
              <div className="pt-2">{AnchorDisplay}</div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-3">
              {eastComps.map(sideCard)}
              {AddBtn}
            </div>
          </div>
        </div>

        {/* Picker — popover on desktop */}
        <TimezonePicker
          open={picker !== null}
          variant="popover"
          anchorRect={picker?.rect}
          onClose={closePicker}
          title={pickerTitle}
          excludeIds={pickerExcludes}
          onSelect={handlePickerSelect}
        />

      </div>
    );
  }

  // ---------- MOBILE LAYOUT (original) ----------
  return (
    <div className="relative mx-auto"
      style={{ maxWidth: 440, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="grain absolute inset-0 pointer-events-none" />

      <header className="px-5 pt-6 pb-2 flex items-center justify-between relative z-10">
        <div>
          <div className="font-serif-display text-[28px] leading-none italic">Meridian</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] mt-1.5"
               style={{ color: 'var(--fg-faint)' }}>
            timezone planner
          </div>
        </div>
        {LiveBadge}
      </header>

      <section className="px-4 pt-2 pb-10 relative z-10">
        {DialMobile}
      </section>

      <div className="mx-5 mt-4 mb-3 flex items-center gap-3 relative z-10">
        <div className="flex-1 h-px" style={{ background: 'var(--line-soft)' }}/>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em]"
             style={{ color: 'var(--fg-faint)' }}>
          elsewhere
        </div>
        <div className="flex-1 h-px" style={{ background: 'var(--line-soft)' }}/>
      </div>

      <section className="px-4 pb-28 relative z-10">
        <div className="grid gap-2 grid-cols-2">
          {tz.comparisons.map((c) => (
            <TimeCard
              key={c.tz.id}
              tz={c.tz}
              minutes={c.minutes}
              dayDelta={c.dayDelta}
              onSelect={(e) => openPicker({ kind: 'slot', slot: c.tz.id }, e)}
              onRemove={tz.removeComparison}
            />
          ))}
          <button
            onClick={(e) => openPicker({ kind: 'add' }, e)}
            className="rounded-2xl p-3 flex items-center justify-center gap-1.5 min-h-[76px]"
            style={{
              background: 'transparent',
              border: '1.5px dashed var(--line)',
              color: 'var(--fg-faint)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            <span className="text-[12px]">Add city</span>
          </button>
        </div>
      </section>

      <TimezonePicker
        open={picker !== null}
        variant="sheet"
        onClose={closePicker}
        title={pickerTitle}
        excludeIds={pickerExcludes}
        onSelect={handlePickerSelect}
      />
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TimezonePlannerApp />);
