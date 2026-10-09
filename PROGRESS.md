# Progress

Updated at the end of every build session by whoever ran it.

## 2026-10-09 (Yuykhan, Claude Code): review of Codex's fixes

Branch: `phase1-app-shell`, [pull request #2](https://github.com/vvessels/evie/pull/2).
Reviewed Codex's commit `abd31a5`; its fixes are sound. Two problems found and fixed:
- The "Couldn't save" banner locked the whole app (Pee and Poop included) with only Try again.
  If the save kept failing there was no way out. Added a "Don't save" button.
- A pee logged during a session refused to save if the session had already ended. With sync
  (piece 3), that happens when the other phone taps Woke up first, and the pee was lost. It now
  saves, just not attached to the session.
- Added `vercel.json` (framework Next.js, `npm run build`). After the Root Directory switch,
  Vercel still served the repo as plain files (the old "Other" preset), so the app gave 404.
- Two regression tests added; 8 of 8 pass, plus lint and build.

### Next
- [ ] Check the preview link opens the app, then both iPhones: add to home screen, log, sleep
      loop, close and reopen mid-session, light and dark, haptic.
- [ ] Merge pull request #2. Then piece 2 (accounts): needs the Supabase project URL and
      publishable key typed into `.env.local` and Vercel by Yuykhan and Jason.

## 2026-10-09 (Yuykhan, Codex): PR #2 review fixes

Branch: `phase1-app-shell`. Continuing [pull request #2](https://github.com/vvessels/evie/pull/2).

### Changed
- Failed writes show a persistent Try again action, retain the chosen entry and original
  time, and release the save lock. Success feedback waits for the database write.
- Bathroom logging and its session link save in one database transaction (both succeed,
  or neither does), so retry cannot create a duplicate after a partial save.
- Sleep-step and session-end drafts clear only after the database confirms the write.
- Undo reopens session notes from their saved text. Continuing a note preserves the
  original, and intentionally clearing a note still works.
- Pee/Poop remain 116px tall in a fixed bottom area across home, panels and sessions.
  Session actions and cancellation scroll above them on shorter screens.
- The history query includes all unfinished sessions, even when started over 48 hours ago.

### Verified
- Added `npm test` with six regression tests: failed-save recovery followed by another log,
  atomic bathroom/session saves, draft preservation on failed step/end writes, editable
  notes after Undo, and old unfinished sessions without deleted rows or duplicates.
- Tests, lint and the production build pass. Browser checks at 390 x 844 measured identical
  Pee/Poop bounds on home, walk and the sleep loop: top 712, bottom 828, height 116 pixels.
  At 320 x 568, the buttons remain 116px tall, bottom 552. Checked session-note Undo and
  bathroom logging during a crate break without losing the draft.
- Reviewed the changed layout against DESIGN.md sections 2–10: existing palette/type,
  fixed large bathroom controls, accessible labels, error announcement, 44px retry target,
  calm copy and no added motion. This is the documented Codex review path.

### Next and limitations
- Claude should review these fixes, then both people must test the installed home-screen
  app on their real iPhones before merge. Desktop checks do not verify iOS keyboard,
  safe-area, storage or haptic behavior.
- Vercel root-directory setup and the status-line type-size decision below remain pending.
- Failed actions are retained for retry while the app stays open. A total storage failure
  cannot guarantee that an unsaved entry survives closing the app; no such claim is made.
- Build reports a fallback-font metrics warning for Atkinson Hyperlegible Next. npm audit
  also reports five high-severity entries in the existing eslint-config-next / braces
  development-tool chain; the added test tools are not the reported source. Investigate
  separately rather than accepting the suggested framework-linter downgrade blindly.

## 2026-10-09 (Yuykhan, Claude Code): phase 1, piece 1 of 4, app shell

Branch: `phase1-app-shell`. Phase 1 is split into four pull requests so each can be reviewed and
tried on the phones on its own:

1. **App shell (this branch).** Next.js 16.4 app with the Log screen ported from
   `prototypes/log.html`: Pee, Poop, Meal, Water, the sleep loop, Walk, Play, Training,
   Socialize, drawn check, toast with Undo and Now/5m/15m/30m offsets, day/night toggle.
   Logs save on the phone (IndexedDB via Dexie), so they survive closing the app; a running
   session survives too. Installable to the home screen (manifest plus a placeholder icon
   drawn in code). Say it saves a note for now; sorting it with Claude is phase 2.
2. **Accounts:** Supabase tables, RLS, household, 6-digit email code sign-in.
3. **Sync:** send local rows to Supabase, live updates from the other phone, offline queue,
   service worker so the app opens with no signal.
4. **Edit and delete:** a Today list (Records button) to tap a log and change or remove it.

### Done (piece 1)
- Tested in the desktop preview at phone size: every flow above, Undo, offsets, reload
  mid-session, light and dark. Not yet tested on an iPhone.
- `npm run build` copies `prototypes/` to `public/prototypes/` first, so prototypes stay
  viewable at `/prototypes/log.html` once Vercel serves the app.

### Next
- [ ] Push the branch and open the pull request; Codex reviews.
- [ ] Jason: in Vercel, switch Root Directory from `prototypes` to `./` (the app is at the root
      now). Then open the branch's preview link on both iPhones, add to home screen, log a few
      things, and check: haptic on tap (iOS 18+), status bar colour in light and dark, the app
      reopening mid-session.
- [ ] Piece 2, accounts.

### Gotchas
- `interface-design` and the other project plugins did **not** load in this Claude Code session
  on Yuykhan's laptop, so `/interface-design:design-review` couldn't run. Checked by hand against
  DESIGN.md instead. Install the plugins (accept the prompt when opening the project, or check
  `/plugin` in a terminal `claude` session) before the next UI pull request.
- DESIGN.md says the status line is 34px; the picked prototype (`log.html`) uses 22px. The app
  follows the prototype (34px wraps "Getting ready for sleep" onto two lines). Decide and update
  DESIGN.md.
- Next.js 16 ships its own docs in `node_modules/next/dist/docs/`; its APIs changed a lot, so
  agents should read those rather than rely on memory.
- The built-in preview browser could read `~/Documents` this time (`.claude/launch.json` runs
  `npm run dev`). Hidden preview tabs slow timers, so the check-then-toast delay looks longer
  there than it is.

## 2026-10-09 (Jason, Claude): fresh public repo

- The repo is now **public** at `vvessels/evie`, started fresh from one commit so no personal
  email addresses are in its history. The old private repo is `vvessels/evie-archive` (full
  history and pull requests #1 to #3).
- Commits use GitHub noreply emails. Jason and Yuykhan both turned on "Keep my email addresses
  private" and "Block command line pushes that expose my email" in GitHub settings.
- Vercel and Supabase are reconnected to the new repo. Vercel's Root Directory is `prototypes`
  until phase 1 adds the app; then switch it to `./`.
- **Phase 1 builder: Yuykhan in Claude Code; Codex reviews.** (Either can take over, see
  AGENTS.md.)

## 2026-10-09 (Jason, Claude): layout picked, repo going public

- Yuykhan made two alternatives with Codex (PR #2). **She picked alternative 1.** It is now
  `prototypes/log.html` (its working name is dropped). The first Claude version is
  `prototypes/log-v1.html`; Codex's alternative 2 stays as `prototypes/codex-2.html`.
- BRIEF.md and DESIGN.md updated: Pee and Poop pinned to the bottom edge in every state.
- DESIGN.md colours fixed so all text passes 4.5:1 contrast (Codex flagged the first values).
- Email addresses removed from BRIEF.md ahead of making the repo public.
- Vercel: Hobby (free) blocks deploys of commits by anyone not on the Vercel account when the
  repo is private. Decision: make the GitHub repo public instead of paying for Pro.

## Phase 0 (started 2026-10-07, Jason)

### Done
- Repo files: `AGENTS.md`, `CLAUDE.md`, `PROGRESS.md`, `.gitignore`, `.claude/settings.json`.
- Private GitHub repo `vvessels/evie` created; Yuykhan (`blackberrybun`) invited with write access
  and has accepted.
- Three design directions prototyped. **Picked C (Handoff) for colours, type and feel.**
- BRIEF.md revised 2026-10-08 with both workflow notes: logging-first home, Pee with target and
  amount, timed sessions, guided sleep flow, voice entry, Ask with accuracy rules, new phases.
- `DESIGN.md` written from C plus the new workflow.
- `prototypes/log.html`: the logging screen with all flows working (open `prototypes/index.html`).
  Published for phones at https://claude.ai/artifact/3B1xjUHSnwbKcLkBfVVvo2 (private; share it
  from the page's Share menu).
- AGENTS.md and SETUP.md cover switching between Claude Code and Codex.
- Jason created the Supabase account.

### Next
- [x] Layout picked: Codex alternative 1, now `log.html`.
- [ ] Try `log.html` on both phones from the Vercel link; list what to change before phase 1.
- [x] Supabase project `evie` created (East US). Yuykhan invited to the organization.
- [ ] Jason imports `vvessels/evie` into Vercel with Root Directory `prototypes` (switch to `./`
      when phase 1 adds the app), turns off Vercel Authentication under Deployment Protection,
      and checks a preview link opens on Yuykhan's phone.
- [ ] Verify the haptic trick on a real iPhone (iOS 18+).
- [ ] Verify the project plugin settings on Yuykhan's laptop (install prompt shows; unrelated
      plugins switched off). Record the result here.
- [ ] Yuykhan connects Codex to the repo (SETUP.md step 6).

### Gotchas
- Evie isn't fully vaccinated, so almost all pees are on the pad indoors. "On target" means the
  pad for now, outside later.
- The local preview server can't read `~/Documents` (macOS privacy), so prototypes were tested by
  serving a copy from a temp folder. Vercel previews will replace this.
