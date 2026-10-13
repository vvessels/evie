import { useSyncExternalStore } from 'react';

// A clock that ticks once a second. Returns 0 while the page is first drawn on the server,
// so anything time-based waits for the phone (which knows the real time) to draw it.
const subscribeTick = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  // Coming back to the app after it sat in the background: update straight away.
  document.addEventListener('visibilitychange', cb);
  return () => { clearInterval(id); document.removeEventListener('visibilitychange', cb); };
};
const nowSecond = () => Math.floor(Date.now() / 1000) * 1000;

export function useNow(): number {
  return useSyncExternalStore(subscribeTick, nowSecond, () => 0);
}
