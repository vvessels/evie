'use client';
// The log so far, filling the space above the keys. Newest sits right above the keys and older
// entries scroll up, so what you just logged is always in view (DESIGN.md: archival).
import { isSession, type EvieEvent } from '@/lib/db';
import { describe } from '@/lib/describe';
import { clock, dayKey, dayLabel, previousDayKey } from '@/lib/time';

function noteOf(ev: EvieEvent) {
  if (ev.type === 'sleep') return (ev.data.steps ?? []).map(s => s.note).filter(Boolean).join('. ');
  return ev.note ?? '';
}

export default function Timeline({ events, now }: { events: EvieEvent[]; now: number }) {
  // Running sessions already have their own card below.
  const rows = events.filter(e => !(isSession(e.type) && !e.endedAt));
  const today = dayKey(now);
  const yesterday = previousDayKey(today);
  const label = (key: string, sample: string) => (key === today ? 'Today' : key === yesterday ? 'Yesterday' : dayLabel(sample));

  const days: { key: string; rows: EvieEvent[] }[] = [];
  for (const ev of rows) {
    const key = dayKey(ev.at);
    if (days.at(-1)?.key !== key) days.push({ key, rows: [] });
    days.at(-1)!.rows.push(ev);
  }

  return (
    // column-reverse keeps the list scrolled to the newest entry, at the bottom, with no script.
    <section className="timeline" aria-label="Log so far">
      {days.length === 0 && <p className="hint tl-empty">What you log shows up here.</p>}
      {days.reverse().map(day => (
        <div className="tl-day" key={day.key}>
          <h3>{label(day.key, day.rows[0].at)}</h3>
          <ol className="tl-list">
            {day.rows.map(ev => {
              const off = (ev.type === 'pee' || ev.type === 'poop') && ev.data.target === 'off';
              const note = noteOf(ev);
              return (
                <li key={ev.id} className={`tl-row${off ? ' off' : ''}`}>
                  <time dateTime={ev.at}>{clock(ev.at)}</time>
                  <span className="tl-what">{describe(ev)}{note && <span className="tl-note">{note}</span>}</span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}
