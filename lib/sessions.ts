import { updateEvent, type EvieEvent, type StepName } from './db';
import { clearDraft, getDraft } from './drafts';

export async function advanceSession(session: EvieEvent, step: StepName, label: string, at: string) {
  const steps = [...(session.data.steps ?? [])];
  const draft = getDraft(session.id).trim();
  if (draft && steps.length) {
    const prev = steps[steps.length - 1];
    steps[steps.length - 1] = { ...prev, note: [prev.note, draft].filter(Boolean).join('. ') };
  }
  steps.push({ step, label, at });
  await updateEvent(session.id, { data: { ...session.data, steps } });
  // Never discard the only saved copy of a note before the database commits.
  clearDraft(session.id);
}

export async function finishSession(session: EvieEvent, endedAt: string) {
  const draft = getDraft(session.id, session.type === 'sleep' ? '' : session.note ?? '').trim();
  const changes: Parameters<typeof updateEvent>[1] = { endedAt };
  if (session.type !== 'sleep') changes.note = draft || null;
  else if (draft) {
    const steps = [...(session.data.steps ?? [])];
    const prev = steps.at(-1);
    if (prev) steps[steps.length - 1] = { ...prev, note: [prev.note, draft].filter(Boolean).join('. ') };
    changes.data = { ...session.data, steps };
  }
  await updateEvent(session.id, changes);
  clearDraft(session.id);
  return { ...session, ...changes };
}
