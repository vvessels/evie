import 'fake-indexeddb/auto';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LogScreen from '@/components/LogScreen';
import { addEvent, addInstantEvent, db, recentEvents, updateEvent } from '@/lib/db';
import { getDraft, setDraft } from '@/lib/drafts';
import { advanceSession, finishSession } from '@/lib/sessions';

vi.mock('@/lib/haptic', () => ({ haptic: vi.fn() }));
vi.mock('@/lib/hooks', () => ({ useNow: () => Date.now() }));

beforeEach(async () => {
  await db.events.clear();
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function ready() {
  render(<LogScreen />);
  await waitFor(() => expect((screen.getByRole('button', { name: 'Water' }) as HTMLButtonElement).disabled).toBe(false));
}

describe('save recovery', () => {
  it('retains a failed choice, retries once and allows another log afterwards', async () => {
    await ready();
    const insert = vi.spyOn(db.events, 'add').mockRejectedValueOnce(new Error('Disk full'));
    fireEvent.click(screen.getByRole('button', { name: 'Pee' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pee on target, medium' }));
    await screen.findByRole('alert');
    expect(await db.events.count()).toBe(0);
    expect(screen.getByRole('button', { name: 'Pee on target, medium' }).textContent).toContain('Medium');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(await db.events.count()).toBe(1);
    expect((await db.events.toArray())[0].data).toEqual({ target: 'on', amount: 'medium' });
    fireEvent.click(screen.getByRole('button', { name: 'Water' }));
    await waitFor(async () => expect(await db.events.count()).toBe(2));
    await waitFor(() => expect((screen.getByRole('button', { name: 'Water' }) as HTMLButtonElement).disabled).toBe(false));
    expect(insert).toHaveBeenCalledTimes(3);
  });

  it('rolls back a bathroom event if linking it to a session fails', async () => {
    const session = await addEvent('sleep', { data: { steps: [{ step: 'out', label: 'Let her out', at: new Date().toISOString() }] } });
    vi.spyOn(db.events, 'update').mockRejectedValueOnce(new Error('Write failed'));
    const at = new Date().toISOString();
    await expect(addInstantEvent('pee', { target: 'on' }, at, session.id)).rejects.toThrow();
    expect(await db.events.count()).toBe(1);
    const ev = await addInstantEvent('pee', { target: 'on' }, at, session.id);
    expect(await db.events.count()).toBe(2);
    expect((await db.events.get(session.id))?.data.steps?.[0].eventIds).toEqual([ev.id]);
    expect(ev.at).toBe(at);
  });

  it('keeps a crate-break draft on failure and commits it once on retry', async () => {
    const session = await addEvent('sleep', { data: { steps: [{ step: 'out', label: 'Let her out', at: new Date().toISOString() }] } });
    setDraft(session.id, 'Had water');
    vi.spyOn(db.events, 'update').mockRejectedValueOnce(new Error('Write failed'));
    const at = new Date().toISOString();
    await expect(advanceSession(session, 'settling', 'Back in crate', at)).rejects.toThrow();
    expect(getDraft(session.id)).toBe('Had water');
    await advanceSession(session, 'settling', 'Back in crate', at);
    const saved = await db.events.get(session.id);
    expect(saved?.data.steps).toHaveLength(2);
    expect(saved?.data.steps?.[0].note).toBe('Had water');
    expect(getDraft(session.id)).toBe('');
  });

  it('keeps a session draft if ending fails', async () => {
    const session = await addEvent('walk');
    setDraft(session.id, 'Park loop');
    vi.spyOn(db.events, 'update').mockRejectedValueOnce(new Error('Write failed'));
    await expect(finishSession(session, new Date().toISOString())).rejects.toThrow();
    expect(getDraft(session.id)).toBe('Park loop');
    expect((await db.events.get(session.id))?.endedAt).toBeNull();
    await finishSession(session, new Date().toISOString());
    expect((await db.events.get(session.id))?.note).toBe('Park loop');
    expect(getDraft(session.id)).toBe('');
  });
});

it('restores the editable note on Undo and saves a continuation without losing the original', async () => {
  await ready();
  fireEvent.click(screen.getByRole('button', { name: 'Walk' }));
  const note = await screen.findByRole('textbox', { name: 'Where did you go?' });
  fireEvent.change(note, { target: { value: 'Park loop' } });
  fireEvent.click(screen.getByRole('button', { name: 'End walk' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Undo' }));
  const restored = await screen.findByRole('textbox', { name: 'Where did you go?' });
  expect((restored as HTMLTextAreaElement).value).toBe('Park loop');
  fireEvent.change(restored, { target: { value: 'Park loop, then home' } });
  fireEvent.click(screen.getByRole('button', { name: 'End walk' }));
  await waitFor(async () => expect((await db.events.toArray())[0].note).toBe('Park loop, then home'));
  fireEvent.click(await screen.findByRole('button', { name: 'Undo' }));
  const again = await screen.findByRole('textbox', { name: 'Where did you go?' });
  fireEvent.change(again, { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'End walk' }));
  await waitFor(async () => expect((await db.events.toArray())[0].note).toBeNull());
});

it('keeps unfinished sessions beyond 48 hours, without duplicates or deleted/old completed rows', async () => {
  const old = new Date(Date.now() - 49 * 3600000).toISOString();
  const running = await addEvent('sleep', { at: old });
  const deleted = await addEvent('walk', { at: old });
  await updateEvent(deleted.id, { deletedAt: new Date().toISOString() });
  await addEvent('sleep', { at: old, endedAt: old });
  await addEvent('pee', { at: old });
  const recent = await addEvent('play');
  expect((await recentEvents()).map(e => e.id)).toEqual([running.id, recent.id]);
});

it('still saves a pee, unlinked, if its session ended before the save', async () => {
  const session = await addEvent('sleep', { data: { steps: [{ step: 'out', label: 'Let her out', at: new Date().toISOString() }] } });
  await updateEvent(session.id, { endedAt: new Date().toISOString() });
  const ev = await addInstantEvent('pee', { target: 'on' }, new Date().toISOString(), session.id);
  expect(await db.events.get(ev.id)).toBeTruthy();
  expect((await db.events.get(session.id))?.data.steps?.[0].eventIds).toBeUndefined();
});

it('lets you dismiss a failed save so the app is usable again', async () => {
  await ready();
  vi.spyOn(db.events, 'add').mockRejectedValue(new Error('Storage broken'));
  fireEvent.click(screen.getByRole('button', { name: 'Water' }));
  await screen.findByRole('alert');
  expect(screen.getByRole('button', { name: 'Pee' }).matches(':disabled')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Don’t save' }));
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  expect(screen.getByRole('button', { name: 'Pee' }).matches(':disabled')).toBe(false);
});
