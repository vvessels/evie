'use client';
import { useEffect, useState } from 'react';
import Check from './Check';

export interface ToastData {
  /** Changes on every new toast, so the hide timer restarts. */
  key: number;
  text: string;
  undo: () => void;
  /** Shown for instant logs: move the time back by 5, 15 or 30 minutes. */
  onOffset?: (minutesAgo: number) => void;
}

const OFFSETS = [0, 5, 15, 30];
const SHOW_MS = 6000;

export default function Toast({ toast }: { toast: ToastData | null }) {
  const [hiddenKey, setHiddenKey] = useState<number | null>(null);
  const [offset, setOffset] = useState({ key: -1, minutes: 0 });

  const shown = !!toast && hiddenKey !== toast.key;
  const minutes = toast && offset.key === toast.key ? offset.minutes : 0;

  // Hide after 6 seconds. Tapping an offset updates the toast's text, which restarts the wait.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setHiddenKey(toast.key), SHOW_MS);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <div className={`toast${shown ? ' show' : ''}`} role="status" aria-live="polite">
      {toast && (
        <>
          <div className="toast-top">
            <span className="msg"><Check size={20} />{toast.text}</span>
            <button onClick={() => { toast.undo(); setHiddenKey(toast.key); }}>Undo</button>
          </div>
          {toast.onOffset && (
            <div className="offsets" role="group" aria-label="When it happened">
              {OFFSETS.map(m => (
                <button
                  key={m}
                  aria-pressed={minutes === m}
                  onClick={() => { toast.onOffset!(m); setOffset({ key: toast.key, minutes: m }); }}
                >
                  {m === 0 ? 'Now' : `${m}m ago`}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
