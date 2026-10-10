// All times show in New York time, whatever time zone the phone is set to (BRIEF.md section 11).
export const TIME_ZONE = 'America/New_York';

const clockFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short', month: 'short', day: 'numeric' });

const toDate = (d: Date | string | number) => (d instanceof Date ? d : new Date(d));

/** "8:52 PM" */
export const clock = (d: Date | string | number) => clockFmt.format(toDate(d));

/** "Fri, Oct 9" */
export const dayLabel = (d: Date | string | number) => dayFmt.format(toDate(d));

const wholeMinutes = (ms: number) => Math.max(0, Math.floor(ms / 60000));

/** For sentences: "1 hr 38 min", "12 min", "less than 1 min". */
export function durText(ms: number) {
  const mins = wholeMinutes(ms);
  if (mins < 1) return 'less than 1 min';
  const h = Math.floor(mins / 60), m = mins % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** For keys: "1h 38m", "12m". */
export function durShort(ms: number) {
  const mins = wholeMinutes(ms), h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

/** For live timers: "1:10:00", "4:05". */
export function timer(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`;
}

const keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

/** The New York calendar day, "2026-10-09", for grouping logs by day. */
export const dayKey = (d: Date | string | number) => keyFmt.format(toDate(d));

/** The day before a dayKey, also "YYYY-MM-DD". Done on the date itself, so clock changes can't shift it. */
export function previousDayKey(key: string) {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
