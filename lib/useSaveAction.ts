'use client';
import { useRef, useState } from 'react';

/** Keep the failed action (including its original time and values) available for retry. */
export function useSaveAction() {
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState<{ retry: () => Promise<void> } | null>(null);

  async function run(action: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await action();
      setFailed(null);
    } catch {
      setFailed({ retry: () => run(action) });
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return { run, saving, failed };
}
