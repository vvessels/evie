import 'fake-indexeddb/auto';
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LogScreen from '@/components/LogScreen';
import Timeline from '@/components/Timeline';
import { addEvent, db, type EvieEvent } from '@/lib/db';
import { previousDayKey } from '@/lib/time';

vi.mock('@/lib/haptic', () => ({ haptic: vi.fn() }));
vi.mock('@/lib/hooks', () => ({ useNow: () => Date.now() }));

beforeEach(async () => {
  await db.events.clear();
  localStorage.clear();
});
afterEach(() => cleanup());

const HOUR = 3600000;
let n = 0;
function ev(type: EvieEvent['type'], at: string, extra: Partial<EvieEvent> = {}): EvieEvent {
  return {
    id: `t${++n}`, type, at, endedAt: null, data: {}, note: null, createdBy: null, createdAt: at,
    updatedBy: null, updatedAt: at, deletedAt: null, source: 'app', synced: 0, ...extra,
  };
}

/** Each day heading with the times listed under it, top to bottom as on screen. */
function days() {
  const timeline = screen.getByRole('region', { name: 'Log so far' });
  // column-reverse shows the last day group in the DOM at the top.
  return [...timeline.querySelectorAll('.tl-day')].reverse().map(day => ({
    heading: day.querySelector('h3')!.textContent,
    times: [...day.querySelectorAll('time')].map(t => t.textContent),
  }));
}

describe('scrolling', () => {
  it('returns to the newest entry when something is logged after scrolling up', async () => {
    for (let i = 0; i < 20; i++) await addEvent('water', { at: new Date(Date.now() - (i + 1) * 10 * 60000).toISOString() });
    render(<LogScreen />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Water' }).matches(':disabled')).toBe(false));
    const timeline = screen.getByRole('region', { name: 'Log so far' });
    await waitFor(() => expect(within(timeline).getAllByText('Water')).toHaveLength(20));

    // jsdom has no layout, so stand in for the browser's scroll position. With column-reverse,
    // negative is scrolled up into older history and 0 is the newest entry.
    let scrollTop = -300;
    Object.defineProperty(timeline, 'scrollTop', { configurable: true, get: () => scrollTop, set: v => { scrollTop = v; } });

    fireEvent.click(screen.getByRole('button', { name: 'Water' }));
    await waitFor(() => expect(within(timeline).getAllByText('Water')).toHaveLength(21));
    expect(scrollTop).toBe(0);
  });
});

describe('48-hour cutoff', () => {
  it('drops an entry once it passes 48 hours old, with only the clock moving', () => {
    const now = Date.parse('2026-10-11T12:00:00Z');
    const water = ev('water', new Date(now - 48 * HOUR + 60000).toISOString()); // 47h59m old
    const { rerender } = render(<Timeline events={[water]} now={now} />);
    expect(screen.getByText('Water')).toBeTruthy();
    rerender(<Timeline events={[water]} now={now + 2 * 60000} />);
    expect(screen.queryByText('Water')).toBeNull();
  });

  it('keeps a session running for over 48 hours in its card, not in the timeline', async () => {
    const start = new Date(Date.now() - 49 * HOUR).toISOString();
    await addEvent('sleep', { at: start, data: { steps: [{ step: 'asleep', label: 'Fell asleep', at: start }] } });
    render(<LogScreen />);
    await screen.findByRole('button', { name: 'Woke up' });
    expect(within(screen.getByRole('region', { name: 'Log so far' })).queryByText(/Sleep|Slept/)).toBeNull();
  });
});

describe('New York day headings', () => {
  it('splits days at New York midnight across the November clock change', () => {
    // Clocks go back at 2 AM EDT on Sun Nov 1 2026, so 1:30 AM happens twice.
    render(<Timeline now={Date.parse('2026-11-02T14:00:00Z')} events={[
      ev('pee', '2026-11-01T03:59:00Z', { data: { target: 'on' } }), // Sat 11:59 PM EDT
      ev('pee', '2026-11-01T04:00:00Z', { data: { target: 'on' } }), // Sun 12:00 AM EDT
      ev('pee', '2026-11-01T05:30:00Z', { data: { target: 'on' } }), // Sun 1:30 AM EDT
      ev('pee', '2026-11-01T06:30:00Z', { data: { target: 'on' } }), // Sun 1:30 AM EST, again
      ev('pee', '2026-11-02T04:59:00Z', { data: { target: 'on' } }), // Sun 11:59 PM EST
      ev('pee', '2026-11-02T05:00:00Z', { data: { target: 'on' } }), // Mon 12:00 AM EST
    ]} />);
    expect(days()).toEqual([
      { heading: 'Sat, Oct 31', times: ['11:59 PM'] },
      { heading: 'Yesterday', times: ['12:00 AM', '1:30 AM', '1:30 AM', '11:59 PM'] },
      { heading: 'Today', times: ['12:00 AM'] },
    ]);
  });

  it('splits days at New York midnight across the March clock change', () => {
    // Clocks go forward at 2 AM EST on Sun Mar 8 2026, so 2:00 to 2:59 AM never happens.
    render(<Timeline now={Date.parse('2026-03-09T13:00:00Z')} events={[
      ev('water', '2026-03-08T04:59:00Z'), // Sat 11:59 PM EST
      ev('water', '2026-03-08T06:59:00Z'), // Sun 1:59 AM EST
      ev('water', '2026-03-08T07:00:00Z'), // Sun 3:00 AM EDT
      ev('water', '2026-03-09T03:59:00Z'), // Sun 11:59 PM EDT
      ev('water', '2026-03-09T04:00:00Z'), // Mon 12:00 AM EDT
    ]} />);
    expect(days()).toEqual([
      { heading: 'Sat, Mar 7', times: ['11:59 PM'] },
      { heading: 'Yesterday', times: ['1:59 AM', '3:00 AM', '11:59 PM'] },
      { heading: 'Today', times: ['12:00 AM'] },
    ]);
  });

  it('finds the previous day across month, year, leap day and clock changes', () => {
    expect(previousDayKey('2026-03-09')).toBe('2026-03-08');
    expect(previousDayKey('2026-11-02')).toBe('2026-11-01');
    expect(previousDayKey('2026-03-01')).toBe('2026-02-28');
    expect(previousDayKey('2028-03-01')).toBe('2028-02-29');
    expect(previousDayKey('2027-01-01')).toBe('2026-12-31');
  });
});

describe('fade', () => {
  it('only fades the timeline when there is room above the newest entry', () => {
    // jsdom can't measure layout, so guard the rule itself: the mask must sit inside the
    // height container query, never on .timeline unconditionally. Checked by eye at 320 x 568.
    const css = readFileSync('app/globals.css', 'utf8');
    const query = css.match(/@container \(min-height: (\d+)px\) \{([\s\S]*?)\n\}/);
    expect(query).not.toBeNull();
    expect(Number(query![1])).toBeGreaterThanOrEqual(88);
    expect(query![2]).toMatch(/mask-image/);
    expect(css.replace(query![0], '')).not.toMatch(/mask-image/);
  });
});
