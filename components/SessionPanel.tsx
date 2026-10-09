'use client';
// A running session replaces the home keys: its card, its next steps, then Pee and Poop.
import type { EvieEvent, StepName } from '@/lib/db';
import { getDraft, setDraft } from '@/lib/drafts';
import { SESSION_NAME, STEP_NAME } from '@/lib/describe';
import { clock, timer } from '@/lib/time';

const SLEEP_HINT: Partial<Record<StepName, string>> = {
  settling: 'In the crate. What happens next?',
  whining: 'Let her out of the crate?',
  out: 'Log what happened, then put her back in the crate.',
  asleep: 'The sleep timer is running.',
};

const NOTE_QUESTION = { walk: 'Where did you go?', play: 'Anything to note?', training: 'Which command?', social: 'What happened, and how did she do?' } as const;

export default function SessionPanel({ session, now, toilet, onStep, onEnd, onCancel }: {
  session: EvieEvent;
  now: number;
  toilet: React.ReactNode;
  onStep: (step: StepName, label: string) => void;
  onEnd: () => void;
  onCancel: () => void;
}) {
  const steps = session.data.steps ?? [];
  const step = steps.at(-1);
  const sleep = session.type === 'sleep';
  const kind = session.type as keyof typeof SESSION_NAME;
  const title = sleep && step ? STEP_NAME[step.step] : SESSION_NAME[kind];
  const whines = steps.filter(s => s.step === 'whining').length;
  const stepStart = Date.parse(step?.at ?? session.at);

  const next = (label: string, to: StepName, primary = false) => (
    <button className={`k${primary ? ' primary' : ''}`} onClick={() => onStep(to, label)}>{label}</button>
  );

  // Each note box is keyed by its step, so a fresh box starts for each "Out of crate".
  const noteBox = (question: string) => (
    <label className="note-label" key={`${session.id}-${steps.length}`}>
      {question}
      <textarea placeholder="Optional note" defaultValue={getDraft(session.id)} onChange={e => setDraft(session.id, e.target.value)} />
    </label>
  );

  let actions: React.ReactNode = null;
  let note: React.ReactNode = null;
  if (sleep) {
    if (step?.step === 'settling') actions = <div className="pair">{next('Whining', 'whining')}{next('Fell asleep', 'asleep', true)}</div>;
    if (step?.step === 'whining') actions = <div className="pair">{next('Keep her in', 'settling')}{next('Let her out', 'out', true)}</div>;
    if (step?.step === 'out') {
      note = noteBox('What did she do?');
      actions = next('Back in crate', 'settling', true);
    }
    if (step?.step === 'asleep') actions = <button className="k primary" onClick={onEnd}>Woke up</button>;
  } else {
    note = noteBox(NOTE_QUESTION[kind as keyof typeof NOTE_QUESTION]);
    actions = <button className="k primary" onClick={onEnd}>End {SESSION_NAME[kind].toLowerCase()}</button>;
  }

  return (
    <>
      <section className="session" aria-label={`${SESSION_NAME[kind]} session`}>
        <div className="session-title">
          <h2><i className="pulse" aria-hidden="true" />{title}</h2>
          <span className="hint">{sleep ? 'Sleep' : 'Started'} {clock(session.at)}</span>
        </div>
        <div className="clock">{timer(now - stepStart)}</div>
        <p className="stage-copy">{sleep ? SLEEP_HINT[step?.step ?? 'settling'] : 'Time is being recorded.'}</p>
        {sleep && <p className="hint">{whines} whining {whines === 1 ? 'round' : 'rounds'}. Total {timer(now - Date.parse(session.at))}</p>}
        {note}
      </section>
      <div className="session-actions">{actions}</div>
      {toilet}
      <div className="session-tools"><button onClick={onCancel}>End without saving</button></div>
    </>
  );
}
