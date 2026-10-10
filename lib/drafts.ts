// Notes typed during a session are kept on the phone as you type, so they survive
// tapping Pee or Poop mid-session, or the app being closed.
const key = (sessionId: string) => `evie-draft-${sessionId}`;

export function getDraft(sessionId: string, fallback = ''): string {
  try { return localStorage.getItem(key(sessionId)) ?? fallback; } catch { return fallback; }
}
export function setDraft(sessionId: string, text: string) {
  try { localStorage.setItem(key(sessionId), text); } catch { /* private mode: the note just isn't kept */ }
}
export function clearDraft(sessionId: string) {
  try { localStorage.removeItem(key(sessionId)); } catch { /* nothing to clear */ }
}
