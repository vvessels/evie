# Progress

Updated at the end of every build session by whoever ran it.

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
