// The log, saved on this phone in IndexedDB (the browser's built-in database) through Dexie.
// Saving here first means a log is never lost to bad signal. Phase 1 piece 3 sends these rows
// to Supabase and pulls the other phone's rows back in; the shape below already matches that.
import Dexie, { type EntityTable } from 'dexie';

export type SessionKind = 'sleep' | 'walk' | 'play' | 'training' | 'social';
export type InstantType = 'pee' | 'poop' | 'water' | 'meal' | 'note';
export type EventType = InstantType | SessionKind;

export const SESSION_KINDS: SessionKind[] = ['sleep', 'walk', 'play', 'training', 'social'];
export const isSession = (type: EventType): type is SessionKind => (SESSION_KINDS as string[]).includes(type);

export type StepName = 'running' | 'settling' | 'whining' | 'out' | 'asleep';
export interface Step {
  step: StepName;
  label: string;
  at: string;
  note?: string;
  /** Pees and poops logged during this step, so the sleep record shows them. */
  eventIds?: string[];
}

export interface EventData {
  target?: 'on' | 'off';
  amount?: 'small' | 'medium' | 'big';
  ate?: 'finished' | 'half_left' | 'barely';
  style?: 'once' | 'onoff';
  steps?: Step[];
}

export interface EvieEvent {
  id: string;
  type: EventType;
  /** When it happened (for sessions, when it started). ISO time. */
  at: string;
  /** Sessions only: null while running. */
  endedAt: string | null;
  data: EventData;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
  /** Soft delete: set instead of removing the row, so Undo can bring it back. */
  deletedAt: string | null;
  source: 'app' | 'voice' | 'import';
  /** 0 until the row has reached Supabase (piece 3). A number because IndexedDB can't index true/false. */
  synced: 0 | 1;
}

const db = new Dexie('evie') as Dexie & { events: EntityTable<EvieEvent, 'id'> };
db.version(1).stores({ events: 'id, at, type, updatedAt, synced' });
export { db };

// crypto.randomUUID needs https; the fallback covers testing over a plain local network address.
function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// Who logged it. Filled in once sign-in exists (piece 2).
const ME: string | null = null;

export async function addEvent(
  type: EventType,
  fields: { data?: EventData; note?: string | null; at?: string; endedAt?: string | null; source?: EvieEvent['source'] } = {},
): Promise<EvieEvent> {
  const now = new Date().toISOString();
  const ev: EvieEvent = {
    id: newId(),
    type,
    at: fields.at ?? now,
    endedAt: fields.endedAt ?? null,
    data: fields.data ?? {},
    note: fields.note ?? null,
    createdBy: ME,
    createdAt: now,
    updatedBy: ME,
    updatedAt: now,
    deletedAt: null,
    source: fields.source ?? 'app',
    synced: 0,
  };
  await db.events.add(ev);
  return ev;
}

export async function updateEvent(id: string, changes: Partial<Pick<EvieEvent, 'at' | 'endedAt' | 'data' | 'note' | 'deletedAt'>>) {
  const updated = await db.events.update(id, { ...changes, updatedBy: ME, updatedAt: new Date().toISOString(), synced: 0 });
  if (!updated) throw new Error('The event no longer exists');
}

/** Save the bathroom event and its session link together, so a retry cannot duplicate it. */
export async function addInstantEvent(type: InstantType, data: EventData, at: string, sessionId?: string) {
  return db.transaction('rw', db.events, async () => {
    const ev = await addEvent(type, { data, at });
    if (sessionId && (type === 'pee' || type === 'poop')) {
      const session = await db.events.get(sessionId);
      if (!session || session.deletedAt || session.endedAt) throw new Error('The session is no longer running');
      const steps = [...(session.data.steps ?? [])];
      const step = steps.at(-1);
      if (step) {
        steps[steps.length - 1] = { ...step, eventIds: [...(step.eventIds ?? []), ev.id] };
        await updateEvent(sessionId, { data: { ...session.data, steps } });
      }
    }
    return ev;
  });
}

export const softDelete = (id: string) => updateEvent(id, { deletedAt: new Date().toISOString() });
export const restore = (id: string) => updateEvent(id, { deletedAt: null });

/** Recent history plus every unfinished session, oldest first, without deleted rows. */
export async function recentEvents(): Promise<EvieEvent[]> {
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const [recent, running] = await Promise.all([
    db.events.where('at').above(since).toArray(),
    db.events.where('type').anyOf(SESSION_KINDS).filter(e => !e.endedAt && !e.deletedAt).toArray(),
  ]);
  const rows = new Map([...recent, ...running].map(e => [e.id, e]));
  return [...rows.values()].filter(e => !e.deletedAt).sort((a, b) => a.at.localeCompare(b.at));
}
