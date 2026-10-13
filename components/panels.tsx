'use client';
// The flows that open in place of the home keys: Pee, Poop, Meal and Say it.
import { useState } from 'react';
import type { EventData } from '@/lib/db';
import { ATE_LABEL } from '@/lib/describe';
import { clock } from '@/lib/time';
import Check from './Check';

/** Which key is showing its drawn check right now. */
export type DoneKey = string | null;

export function PanelHead({ title, question, onCancel }: { title: string; question?: string; onCancel: () => void }) {
  return (
    <div className="panel-head">
      <h2>{title}{question && <span className="q">{question}</span>}</h2>
      <button className="icon-btn" onClick={onCancel} aria-label="Cancel">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  );
}

/** A choice key that fills dark and draws a check once tapped. */
function ChoiceKey({ id, done, className = 'k tall', label, sub, ariaLabel, onPick }: {
  id: string; done: DoneKey; className?: string; label: string; sub?: string; ariaLabel?: string; onPick: (id: string) => void;
}) {
  const isDone = done === id;
  return (
    <button className={`${className}${isDone ? ' done' : ''}`} disabled={!!done} onClick={() => onPick(id)} aria-label={ariaLabel}>
      {label}
      <small>{isDone ? <Check /> : sub}</small>
    </button>
  );
}

const AMOUNTS = ['small', 'medium', 'big'] as const;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export function PeePanel({ done, onCancel, onLog }: { done: DoneKey; onCancel: () => void; onLog: (key: string, data: EventData) => void }) {
  const row = (target: 'on' | 'off') => AMOUNTS.map(amount => (
    <ChoiceKey
      key={amount}
      id={`pee-${target}-${amount}`}
      done={done}
      className={`k tall${target === 'off' ? ' off' : ''}`}
      label={cap(amount)}
      ariaLabel={`Pee ${target} target, ${amount}`}
      onPick={key => onLog(key, { target, amount })}
    />
  ));
  return (
    <div className="panel">
      <PanelHead title="Pee" question="Where, and how much?" onCancel={onCancel} />
      <div className="rowlabel">On target</div>
      <div className="grid3">{row('on')}</div>
      <div className="rowlabel off">Off target</div>
      <div className="grid3">{row('off')}</div>
    </div>
  );
}

export function PoopPanel({ done, onCancel, onLog }: { done: DoneKey; onCancel: () => void; onLog: (key: string, data: EventData) => void }) {
  return (
    <div className="panel">
      <PanelHead title="Poop" question="Where?" onCancel={onCancel} />
      <div className="pair">
        <ChoiceKey id="poop-on" done={done} className="k tall taller" label="On target" sub="Pad or outside" onPick={key => onLog(key, { target: 'on' })} />
        <ChoiceKey id="poop-off" done={done} className="k tall taller off" label="Off target" sub="Accident" onPick={key => onLog(key, { target: 'off' })} />
      </div>
    </div>
  );
}

export function MealPanel({ done, onCancel, onLog }: { done: DoneKey; onCancel: () => void; onLog: (key: string, data: EventData) => void }) {
  const [style, setStyle] = useState<'once' | 'onoff'>('once');
  return (
    <div className="panel">
      <PanelHead title="Meal" question="How did she eat?" onCancel={onCancel} />
      <div className="seg" role="group" aria-label="How she ate">
        <button aria-pressed={style === 'once'} onClick={() => setStyle('once')}>All at once</button>
        <button aria-pressed={style === 'onoff'} onClick={() => setStyle('onoff')}>On and off</button>
      </div>
      <div className="rowlabel">How much?</div>
      <div className="grid3">
        {(Object.keys(ATE_LABEL) as (keyof typeof ATE_LABEL)[]).map(ate => (
          <ChoiceKey key={ate} id={`meal-${ate}`} done={done} label={ATE_LABEL[ate]} onPick={key => onLog(key, { ate, style })} />
        ))}
      </div>
    </div>
  );
}

// Say it: for now this saves what you said as a note. Sorting it into pee, meal and so on
// (with Claude) is phase 2. It never saves without the Log it tap.
export function VoicePanel({ now, onCancel, onLog }: { now: number; onCancel: () => void; onLog: (text: string) => void }) {
  const [text, setText] = useState('');
  const said = text.trim();
  return (
    <div className="panel">
      <PanelHead title="Say it" onCancel={onCancel} />
      <textarea
        autoFocus
        aria-label="What happened"
        placeholder="Tap the mic on your keyboard and talk."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      {said && (
        <>
          <div className="heard">Got it as a note<b>{said}, {clock(now)}</b></div>
          <button className="k main wide" style={{ minHeight: 64, fontSize: 19 }} onClick={() => onLog(said)}>Log it</button>
        </>
      )}
      <p className="hint">For now this saves a note. Sorting what you say into the right log comes later.</p>
    </div>
  );
}
