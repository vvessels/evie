// Shared by all three prototypes: Evie's real log from 2026-10-07, a simulated clock,
// and the logging logic. Only the look differs between directions.

(function () {
  // The clock starts at 8:41 PM on Oct 7 and runs in real time from page load.
  const START = (window.EVIE_START || new Date(2026, 9, 7, 20, 41, 0)).getTime();
  const LOADED = Date.now();
  let skipped = 0;
  const now = () => new Date(START + (Date.now() - LOADED) + skipped);
  const skip = (mins) => { skipped += mins * 60000; };
  const at = (h, m) => new Date(2026, 9, 7, h, m, 0);

  const PEOPLE = {
    J: { name: 'Jason', initial: 'J' },
    Y: { name: 'Yuykhan', initial: 'Y' },
  };

  // From import/evie-log.csv. A few unstated times are filled in for the mockup.
  let seq = 0;
  const e = (h, m, type, by, extra = {}) => ({ id: 'e' + ++seq, t: at(h, m), type, by, ...extra });
  const events = [
    e(0, 30, 'sleep', 'J', { loc: 'crate' }),
    e(7, 30, 'wake', 'Y'),
    e(7, 39, 'pee', 'Y', { loc: 'pad' }),
    e(7, 40, 'poop', 'Y', { loc: 'pad' }),
    e(7, 54, 'meal', 'Y', { amount: '3 tbsp' }),
    e(8, 16, 'pee', 'Y', { loc: 'pad' }),
    e(8, 40, 'walk', 'Y', { note: 'Socializing downstairs, 15 min' }),
    e(8, 58, 'pee', 'Y', { loc: 'inside', note: 'Two, right after coming back' }),
    e(9, 0, 'sleep', 'Y', { nap: true }),
    e(11, 2, 'wake', 'J'),
    e(11, 11, 'pee', 'J', { loc: 'pad' }),
    e(11, 19, 'pee', 'J', { loc: 'pad', note: 'Third pee' }),
    e(11, 26, 'poop', 'J', { loc: 'pad' }),
    e(11, 47, 'meal', 'J', { amount: '3 tbsp' }),
    e(12, 5, 'pee', 'J', { loc: 'pad' }),
    e(12, 15, 'sleep', 'J', { nap: true }),
    e(13, 35, 'wake', 'Y'),
    e(13, 41, 'pee', 'Y', { loc: 'inside', note: 'Old pad spot' }),
    e(13, 50, 'training', 'Y', { note: 'Name game, short session' }),
    e(14, 7, 'pee', 'Y', { loc: 'inside', note: 'Old spot again' }),
    e(14, 41, 'crate', 'Y'),
    e(14, 44, 'sleep', 'Y', { nap: true }),
    e(14, 53, 'wake', 'Y', { note: 'Crying' }),
    e(14, 55, 'uncrate', 'Y'),
    e(15, 5, 'pee', 'Y', { loc: 'pad', note: 'New spot' }),
    e(15, 25, 'crate', 'Y', { note: 'With toys' }),
    e(15, 27, 'sleep', 'Y', { nap: true }),
    e(17, 46, 'wake', 'J'),
    e(17, 47, 'uncrate', 'J'),
    e(17, 50, 'pee', 'J', { loc: 'pad' }),
    e(17, 57, 'meal', 'J', { amount: '3 tbsp' }),
    e(18, 7, 'pee', 'J', { loc: 'pad' }),
    e(18, 35, 'pee', 'J', { loc: 'pad' }),
    e(18, 36, 'walk', 'J', { note: 'Outside until 7:02' }),
    e(19, 3, 'pee', 'J', { loc: 'pad' }),
    e(19, 8, 'poop', 'J', { loc: 'pad' }),
    e(19, 45, 'sleep', 'J', { nap: true }),
  ];

  const LABEL = {
    pee: 'Pee', poop: 'Poop', meal: 'Meal', water: 'Water', sleep: 'Asleep', wake: 'Woke up',
    crate: 'In crate', uncrate: 'Out of crate', walk: 'Walk', play: 'Play',
    training: 'Training', meds: 'Meds', vet: 'Vet', weight: 'Weight', note: 'Note',
  };
  const LOC = { pad: 'on the pad', outside: 'outside', inside: 'inside', crate: 'in the crate' };

  // Plain-language line for an event, used in timelines and toasts.
  function describe(ev) {
    if ((ev.type === 'pee' || ev.type === 'poop') && ev.loc === 'inside')
      return (ev.type === 'pee' ? 'Pee' : 'Poop') + ' accident inside';
    if (ev.type === 'pee' || ev.type === 'poop') return LABEL[ev.type] + ' ' + (LOC[ev.loc] || '');
    if (ev.type === 'sleep') return ev.nap ? 'Fell asleep' : 'Asleep for the night';
    if (ev.type === 'meal') return 'Meal, ' + (ev.amount || '3 tbsp');
    return LABEL[ev.type];
  }

  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());
  const sorted = () => events.filter((x) => !x.deleted).sort((a, b) => a.t - b.t);
  const last = (pred) => { const s = sorted().filter(pred); return s[s.length - 1]; };

  function state() {
    const n = now();
    const lastSleep = last((x) => x.type === 'sleep' || x.type === 'wake');
    const lastCrate = last((x) => x.type === 'crate' || x.type === 'uncrate');
    return {
      now: n,
      pee: last((x) => x.type === 'pee'),
      poop: last((x) => x.type === 'poop'),
      meal: last((x) => x.type === 'meal'),
      asleep: lastSleep && lastSleep.type === 'sleep' ? lastSleep : null,
      awakeSince: lastSleep && lastSleep.type === 'wake' ? lastSleep : null,
      crated: lastCrate && lastCrate.type === 'crate' ? lastCrate : null,
      lastPeeLoc: (last((x) => x.type === 'pee' && x.loc !== 'inside') || {}).loc || 'pad',
      today: sorted(),
    };
  }

  function log(type, opts = {}) {
    const ev = { id: 'e' + ++seq, t: now(), type, by: 'J', fresh: true, ...opts };
    events.push(ev);
    haptic();
    emit();
    return ev;
  }
  function undo(id) { const ev = events.find((x) => x.id === id); if (ev) ev.deleted = true; emit(); }
  function shift(id, minsAgo) {
    const ev = events.find((x) => x.id === id);
    if (ev) { ev.t = new Date(now().getTime() - minsAgo * 60000); ev.offset = minsAgo; }
    emit();
  }

  // Formatting
  function elapsed(from, to = now()) {
    const mins = Math.max(0, Math.floor((to - from) / 60000));
    return { h: Math.floor(mins / 60), m: mins % 60, mins };
  }
  function ago(from) {
    const { h, m } = elapsed(from);
    if (h === 0) return m + ' min';
    return h + ' hr' + (m ? ' ' + m + ' min' : '');
  }
  function clock(d, withPeriod = true) {
    let h = d.getHours(); const m = d.getMinutes();
    const p = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return h + ':' + String(m).padStart(2, '0') + (withPeriod ? ' ' + p : '');
  }

  // iOS Safari has no vibration API. iOS 18+ plays a system haptic when a
  // <input type="checkbox" switch> is toggled, so we toggle a hidden one.
  // Unverified on a real iPhone yet: phase 0 checks this.
  let hapticLabel;
  function haptic() {
    if (navigator.vibrate) { navigator.vibrate(12); return; }
    if (!hapticLabel) {
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
      wrap.innerHTML = '<label id="hx"><input type="checkbox" switch></label>';
      document.body.appendChild(wrap);
      hapticLabel = wrap.querySelector('label');
    }
    hapticLabel.click();
  }

  // Drawn checkmark: an SVG tick whose stroke draws itself in ~260ms.
  function check(size = 28) {
    return `<svg class="drawn-check" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 12.5l4.6 4.6L19.5 6.8" fill="none" stroke="currentColor" stroke-width="2.4"
        stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>`;
  }

  // Night mode: follows the phone, with a manual override stored per prototype.
  function initTheme(key) {
    const root = document.documentElement;
    let saved = null;
    try { saved = localStorage.getItem(key); } catch (_) {}
    if (saved) root.dataset.theme = saved;
    return function toggle() {
      const dark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem(key, root.dataset.theme); } catch (_) {}
    };
  }

  // Add a past event (used by prototypes to set up a scene).
  function add(h, m, type, by, extra = {}) { const ev = e(h, m, type, by, extra); events.push(ev); return ev; }

  window.Evie = {
    now, add, events, skip, state, log, undo, shift, describe, elapsed, ago, clock, check, haptic, initTheme,
    PEOPLE, LABEL, LOC, subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
  };
})();
