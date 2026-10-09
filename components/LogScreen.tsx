'use client';
// The home screen: quiet status at the top, logging keys anchored to the bottom (DESIGN.md section 2).
import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  addEvent, addInstantEvent, isSession, recentEvents, restore, softDelete, updateEvent,
  type EventData, type EvieEvent, type InstantType, type SessionKind, type StepName,
} from '@/lib/db';
import { describe, SESSION_NAME, sessionSummary } from '@/lib/describe';
import { advanceSession, finishSession } from '@/lib/sessions';
import { useSaveAction } from '@/lib/useSaveAction';
import { haptic } from '@/lib/haptic';
import { useNow } from '@/lib/hooks';
import { clock, dayLabel, durShort, durText } from '@/lib/time';
import Check from './Check';
import { MealPanel, PeePanel, PoopPanel, VoicePanel, type DoneKey } from './panels';
import SessionPanel from './SessionPanel';
import Toast, { type ToastData } from './Toast';

type View = 'home' | 'pee' | 'poop' | 'meal' | 'voice';

// Long enough to see the check draw (260ms), short enough to stay under 3 seconds a log.
const CONFIRM_MS = 380;
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

const HOME_KEYS: [SessionKind | 'meal' | 'water', string][] = [
  ['meal', 'Meal'], ['water', 'Water'], ['sleep', 'Sleep'],
  ['walk', 'Walk'], ['play', 'Play'], ['training', 'Training'], ['social', 'Socialize'],
];

export default function LogScreen() {
  const now = useNow();
  const events = useLiveQuery(recentEvents);
  const [view, setView] = useState<View>('home');
  const [done, setDone] = useState<DoneKey>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const { run, saving, failed } = useSaveAction();
  const blocked = saving || !!failed;
  const toastCount = useRef(0);

  // Escape closes a panel (keyboards and VoiceOver).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !blocked) setView('home'); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [blocked]);

  const ready = now > 0 && events !== undefined;
  const list = events ?? [];
  const last = (pred: (e: EvieEvent) => boolean) => list.findLast(pred);
  const running = last(e => isSession(e.type) && !e.endedAt);
  const lastPee = last(e => e.type === 'pee');
  const lastPoop = last(e => e.type === 'poop');
  const lastWake = last(e => e.type === 'sleep' && !!e.endedAt);

  const showToast = (t: Omit<ToastData, 'key'>) => setToast({ ...t, key: ++toastCount.current });

  /** Show success only after the write commits; always clear the confirmation lock. */
  function confirmThen(key: string, save: () => Promise<EvieEvent>) {
    return run(async () => {
      try {
        const ev = await save();
        setDone(key);
        haptic();
        await wait(CONFIRM_MS);
        setView('home');
        const toastKey = ++toastCount.current;
        setToast({
          key: toastKey,
          text: `${describe(ev)}, ${clock(ev.at)}`,
          undo: () => run(() => softDelete(ev.id)),
          onOffset: minutes => {
            const at = new Date(Date.parse(ev.at) - minutes * 60000).toISOString();
            return run(async () => {
              await updateEvent(ev.id, { at });
              setToast(t => (t?.key === toastKey ? { ...t, text: `${describe(ev)}, ${clock(at)}` } : t));
            });
          },
        });
      } finally {
        setDone(null);
      }
    });
  }

  function logInstant(key: string, type: InstantType, data: EventData = {}) {
    const at = new Date().toISOString();
    return confirmThen(key, () => addInstantEvent(type, data, at, running?.id));
  }

  function logNote(text: string) {
    const at = new Date().toISOString();
    return run(async () => {
      const ev = await addEvent('note', { note: text, source: 'voice', at });
      haptic();
      setView('home');
      showToast({ text: `Note, ${clock(ev.at)}`, undo: () => run(() => softDelete(ev.id)) });
    });
  }

  function startSession(kind: SessionKind) {
    if (running) return;
    const at = new Date().toISOString();
    return run(async () => {
      await addEvent(kind, { at, data: { steps: [{ step: kind === 'sleep' ? 'settling' : 'running', label: kind === 'sleep' ? 'Settling' : SESSION_NAME[kind], at }] } });
      haptic();
    });
  }

  function nextStep(step: StepName, label: string) {
    if (!running) return;
    const at = new Date().toISOString();
    return run(async () => {
      await advanceSession(running, step, label, at);
      haptic();
    });
  }

  function endSession() {
    if (!running) return;
    const s = running;
    const endedAt = new Date().toISOString();
    return run(async () => {
      const ended = await finishSession(s, endedAt);
      haptic();
      // The reopened note field falls back to the saved session note.
      showToast({ text: sessionSummary(ended), undo: () => run(() => updateEvent(s.id, { endedAt: null })) });
    });
  }

  function cancelSession() {
    if (!running) return;
    const id = running.id;
    return run(async () => {
      await softDelete(id);
      showToast({ text: 'Session ended without saving', undo: () => run(() => restore(id)) });
    });
  }

  // ---------- status line ----------
  let big = '';
  if (ready) {
    if (running?.type === 'sleep') big = running.data.steps?.at(-1)?.step === 'asleep' ? 'Evie is asleep' : 'Getting ready for sleep';
    else if (running) big = `${SESSION_NAME[running.type as SessionKind]} in progress`;
    else if (lastWake?.endedAt) big = now - Date.parse(lastWake.endedAt) < 60000 ? 'Just woke up' : `Awake ${durText(now - Date.parse(lastWake.endedAt))}`;
    else big = 'Awake';
  }
  const since = (e: EvieEvent | undefined, word: string) => (e ? `${word} ${durText(now - Date.parse(e.at))} ago.` : `No ${word.toLowerCase()} logged yet.`);
  const meta = ready ? `${since(lastPee, 'Pee')} ${since(lastPoop, 'Poop')}` : '';

  const agoKey = (e: EvieEvent | undefined) => {
    if (!ready || !e) return '';
    const ms = now - Date.parse(e.at);
    return ms < 60000 ? 'Just now' : `${durShort(ms)} ago`;
  };
  const toilet = (
    <div className="toilet pair">
      <button className="k main" onClick={() => setView('pee')} disabled={!ready}>
        Pee<small>{agoKey(lastPee)}</small>
      </button>
      <button className="k main" onClick={() => setView('poop')} disabled={!ready}>
        Poop<small>{agoKey(lastPoop)}</small>
      </button>
    </div>
  );

  // ---------- controls ----------
  let controls: React.ReactNode;
  const home = () => setView('home');
  if (view === 'pee') controls = <PeePanel done={done} onCancel={home} onLog={(k, d) => logInstant(k, 'pee', d)} />;
  else if (view === 'poop') controls = <PoopPanel done={done} onCancel={home} onLog={(k, d) => logInstant(k, 'poop', d)} />;
  else if (view === 'meal') controls = <MealPanel done={done} onCancel={home} onLog={(k, d) => logInstant(k, 'meal', d)} />;
  else if (view === 'voice') controls = <VoicePanel now={now} onCancel={home} onLog={logNote} />;
  else if (running) controls = <SessionPanel session={running} now={now} onStep={nextStep} onEnd={endSession} onCancel={cancelSession} />;
  else controls = (
    <>
      <div className="grid3">
        {HOME_KEYS.map(([kind, label]) => {
          if (kind === 'water') {
            const isDone = done === 'water';
            return (
              <button key={kind} className={`k${isDone ? ' done' : ''}`} disabled={!ready || !!done} onClick={() => logInstant('water', 'water')}>
                {label}{isDone && <Check />}
              </button>
            );
          }
          const open = () => (kind === 'meal' ? setView('meal') : startSession(kind));
          return <button key={kind} className="k" disabled={!ready} onClick={open}>{label}</button>;
        })}
        <button className="k voice" disabled={!ready} onClick={() => setView('voice')}>Say it</button>
      </div>
    </>
  );

  return (
    <div className="app">
      <header className="top">
        <span className="name">Evie<span>{ready ? dayLabel(now) : ''}</span></span>
        <ThemeToggle />
      </header>
      <section className="state" aria-live="polite">
        <p className="big">{big}</p>
        <p className="meta">{meta}</p>
      </section>
      <main className="controls" aria-label="Log">
        {failed && <div className="save-error" role="alert">
          <p>Couldn’t save. Your entry is still here.</p>
          <button className="k" disabled={saving} onClick={failed.retry}>{saving ? 'Saving…' : 'Try again'}</button>
        </div>}
        <fieldset className="flow" disabled={blocked} aria-busy={saving}>{controls}</fieldset>
        <fieldset className="toilet-dock" disabled={!ready || blocked} aria-label="Bathroom logging">{toilet}</fieldset>
      </main>
      <Toast toast={toast} disabled={blocked} />
    </div>
  );
}

// Night colours follow the phone's setting; this button overrides it and the choice is remembered.
function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('evie-theme', root.dataset.theme); } catch { /* not remembered in private mode */ }
  };
  return (
    <button className="icon-btn" onClick={toggle} aria-label="Switch day or night colours">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
    </button>
  );
}
