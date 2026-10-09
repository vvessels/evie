# Rules for every AI agent on this project

This file is read by Claude (via CLAUDE.md) and by Codex. One source, no drift.

## Before you start

1. Pull the latest from GitHub.
2. Read `BRIEF.md` (the spec; it wins over chat), `PROGRESS.md` (what's done, what's next,
   gotchas) and `DESIGN.md` (once it exists, the design source of truth).
3. Work on a branch, never directly on `main`. Merge by pull request after Codex reviews it.
4. One builder at a time. Never two agents editing the same files at once.

## Switching between Claude Code and Codex

Either tool can build at any stage. The repo is the handoff; nothing lives only in one tool's chat.

- **Before handing off**, the outgoing tool: commits its work, pushes the branch to GitHub, and
  writes in `PROGRESS.md` which branch it was on, what's half done, and what's next.
- **When picking up**, the incoming tool: pulls, checks out that branch (or starts a new one from
  `main`), reads `PROGRESS.md`, then continues.
- Never both tools on the same branch at the same time.
- Whichever tool did not build a change reviews its pull request.
- Design prototypes: add a new file in `prototypes/` (e.g. `prototypes/codex-log-1.html`) that
  loads `shared.js` for the data, rather than editing someone else's prototype. Follow `DESIGN.md`
  unless the task is explicitly to explore something different.

## The people

- Jason (designer, learning dev) and Yuykhan both use the app daily and both run build
  sessions. Neither is a professional developer.
- **Teach as you go.** Define jargon in plain words the first time it appears (git, branch,
  pull request, npm, API, environment variable, RLS...). When you run a command, say what it
  did and what changed, so they can run it themselves next time.
- **Never enter passwords, create accounts, or paste secret keys anywhere but `.env.local`
  and Vercel's settings.** Walk them through it; they type it.
- Give a recommendation with reasons, not a menu of options.

## Product rules

- Speed of logging beats everything. Logging a pee is two taps, under 3 seconds.
- Both phones see each other's logs live. Offline logs are saved locally and synced later;
  a log is never lost.
- Deletes are soft with an Undo toast. No confirm dialogs.
- Every number in Guidance cites a named expert source, checked at the source. No source,
  no ship.
- Time zone: America/New_York for all times and day boundaries.

## Writing and design

- **No em-dashes in any UI copy.** Use a comma, period or colon.
- Plain, calm, sentence-case copy. Buttons say exactly what happens.
- UI changes follow `DESIGN.md`, and run `/interface-design:design-review` (fix what it
  finds) before the pull request.
- 44pt minimum tap targets, VoiceOver labels on icon-only controls, readable dark mode.

## Done means verified

- **Verify on both real iPhones** (the installed home-screen app, not Safari, not a desktop
  browser) before calling anything done. Use the Vercel preview link for the branch.
- Claims about how iOS behaves (haptics, login, storage) are checked on a device, not assumed.

## End of every session

Update `PROGRESS.md`: what got done, what's next, any gotchas found.
