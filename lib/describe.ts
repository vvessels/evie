// Plain words for a log, used by the toast and status line. No em-dashes in anything returned.
import type { EvieEvent, SessionKind, Step, StepName } from './db';
import { durText } from './time';

export const SESSION_NAME: Record<SessionKind, string> = {
  sleep: 'Sleep', walk: 'Walk', play: 'Play', training: 'Training', social: 'Socialization',
};

export const STEP_NAME: Record<StepName, string> = {
  running: '', settling: 'Settling', whining: 'Whining', out: 'Out of crate', asleep: 'Asleep',
};

export const ATE_LABEL = { finished: 'Finished', half_left: 'Half left', barely: 'Barely ate' } as const;

export function describe(ev: EvieEvent): string {
  const d = ev.data;
  switch (ev.type) {
    case 'pee':
    case 'poop': {
      const what = ev.type === 'pee' ? 'Pee' : 'Poop';
      return `${what} ${d.target === 'off' ? 'off' : 'on'} target${d.amount ? ', ' + d.amount : ''}`;
    }
    case 'water':
      return 'Water';
    case 'meal':
      return 'Meal' + (d.ate ? ', ' + ATE_LABEL[d.ate].toLowerCase() : '') + (d.style === 'onoff' ? ', on and off' : '');
    case 'note':
      return 'Note';
    default:
      return ev.endedAt ? sessionSummary(ev) : `${SESSION_NAME[ev.type]}, in progress`;
  }
}

const times = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);

/** Total time spent in "Out of crate" steps. */
function outOfCrate(steps: Step[], end: number) {
  return steps.reduce((sum, s, i) => sum + (s.step === 'out' ? (steps[i + 1] ? Date.parse(steps[i + 1].at) : end) - Date.parse(s.at) : 0), 0);
}

/** "Slept 1 hr 10 min, took 10 min to fall asleep, whined once" or "Walk, 25 min". */
export function sessionSummary(ev: EvieEvent): string {
  const start = Date.parse(ev.at), end = ev.endedAt ? Date.parse(ev.endedAt) : Date.now();
  if (ev.type !== 'sleep') return `${SESSION_NAME[ev.type as SessionKind]}, ${durText(end - start)}`;
  const steps = ev.data.steps ?? [];
  const asleep = steps.find(s => s.step === 'asleep');
  const whines = steps.filter(s => s.step === 'whining').length;
  const out = outOfCrate(steps, end);
  if (!asleep) return `Sleep ended before she fell asleep, ${durText(end - start)}`;
  const asleepAt = Date.parse(asleep.at);
  return [
    `Slept ${durText(end - asleepAt)}`,
    `took ${durText(asleepAt - start)} to fall asleep`,
    whines ? `whined ${times(whines)}` : '',
    out ? `out of crate ${durText(out)}` : '',
  ].filter(Boolean).join(', ');
}
