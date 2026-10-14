# Progress

Updated at the end of every build session by whoever ran it.

## 2026-10-13 (Yuykhan, Claude Code): fixes for Codex's polish review

Branch: `polish-and-fixes`, PR #4. Addresses
[Codex's review](https://github.com/vvessels/evie/pull/4#pullrequestreview-5507786958). Not merged.

### Fixed
- **Dictation listening button** (`prototypes/dictation-test.html`): listening is now the surface
  colour with ink text and a 2px ink ring, not `--off`. Measured 17.61:1 light, 12.68:1 dark
  (idle 15.7:1). `--off` removed from that page. Each new attempt also clears the previous
  transcript and logs "attempt: transcript cleared", so a failed retry can't look like new words.
- **Undo test race** (`tests/logging.test.tsx`): reproduced first, 2 failures in 18 runs under
  load. The test now waits for the walk's card to go and for Undo to be enabled (only after the
  new toast is set) before tapping Undo, then for the reopened note box. All note assertions kept,
  plus one more: the second reopen shows "Park loop, then home". 24 of 24 runs pass under the
  same load.
- **Press motion** (`app/globals.css`): keys transition `transform` only; the pressed shadow
  switches instantly. DESIGN.md section 7 says so. New `tests/design.test.tsx` fails if any
  `transition` animates anything but transform or opacity (checked: it fails on the old code).
- DESIGN.md line tokens now match the CSS (`.08/.18` light, `.08/.16` dark).

### Verified
- `npm test` 18 of 18 (after a clean `npm ci`), `npm run lint` clean, `npm run build` passes
  (known fallback-font warning).
- Desktop browser, dev server, light and dark:
  - 390 x 844: home keys 114 x 72, only `transform 0.16s` on keys, Pee/Poop 175 x 116 at y=712.
    Pee panel and sleep (settling, whining, out of crate) fit with no page scroll, nothing under 44px.
  - 320 x 568: Pee/Poop 140 x 116 at y=436 everywhere, no sideways overflow, nothing under 44px.
    Home timeline 21px. Page scroll needed: Pee panel 65px, sleep settling/whining 128px, out of
    crate 229px (actions reachable above the dock after scrolling).

### Recommended follow-up (separate PR): short screens
Only matters if one of our phones is short (SE or mini, 568 to 667px tall); Jason's 14 Pro Max
is 932px. If so, a focused PR under a `max-height: 700px` rule, keeping every key size:
- Status line 28 to 22px, session timer 52 to 40px, documented in DESIGN.md as a short-screen scale.
- Trim non-tappable spacing: status top margin, controls top padding, session card padding and gap.
- Session note box starts one line tall (grows when typing).
- Target at 320 x 568: Pee panel and sleep settling/whining with no scrolling. Out of crate (with its
  note box) may still scroll, as it does when the keyboard is up anyway.
- Keep wider layout changes and the softer timeline separators out of that PR.

### Still pending on both real iPhones (installed home-screen app, not done)
- Haptic on tap (Jason's 14 Pro Max: didn't fire before this PR's change). Record iOS versions.
- Dictation test from the Safari tab and from its own home-screen icon.
- Yuykhan's phone: keyboard and safe areas, touch scrolling, Pee and sleep actions, closing and
  reopening mid-session.

## 2026-10-13 (Yuykhan, Codex): polish review

Branch: `polish-and-fixes`, PR #4. Reviewed Claude Code's `0dc8c8c` against AGENTS.md
and DESIGN.md sections 2 to 10.
[Review and design audit posted](https://github.com/vvessels/evie/pull/4#pullrequestreview-5507786958).
No app, prototype or test fixes made; this handoff commit changes only this progress note.

### Findings for Claude Code
- Dictation test's listening/stop button has only 2.45:1 contrast in dark mode; use a readable
  neutral token pair, keeping the accident colour for accidents.
- `npm test` failed twice, 16/17 passing. The Undo note test can find the old session field
  before the database-driven UI closes it, then fail to find End walk. An instrumented copy
  reproduced this timing race. All ten logging tests passed in a temporary copy that waits
  for the old session to disappear and Undo to be enabled before reopening. Browser Undo,
  edit and save worked; this is not evidence of lost notes. Stabilize the checked-in test.
- New `box-shadow` transitions contradict DESIGN section 7's transform/opacity-only rule.
  Keep depth changes immediate or crossfade with opacity. Reduced-motion override is correct.

### Verified and design recommendations
- Installed locked dependencies. Lint and production build pass (existing Atkinson fallback
  warning). Main's 17 tests passed with the same dependencies; PR's full suite remains failing.
- Home, Pee panel and settling sleep checked at 390 x 844 and 320 x 568 in light and dark.
  No home-grid horizontal overflow; standard keys stay 72px, icons 22px, Say it two columns.
  Labels centre without empty time lines; icons stay hidden from accessible names. Main-app
  text contrast passes, including gradients. No UI em-dashes or new entrance animations.
- Pee/Poop remain pinned. Short-screen Pee/sleep actions need page scrolling and remain
  reachable. Hidden timeline scrollbar still scrolls; logging returns to newest, no short-screen
  fade. Haptic calls are before the first await, but physical feedback is not verified.
- Dictation page is served by the production build; inspected layout and recognition handlers.
  Did not request microphone access or test actual speech recognition.
- Recommended next polish: a compact short-screen layout using less noninteractive spacing
  and a documented smaller status/timer scale, preserving tap targets. Home history has about
  21px at 320 x 568. Consider quieter history separators; reconcile DESIGN's line-token table
  with CSS; clear or label a previous dictation transcript when another attempt begins.

### Next and still unverified
- Claude Code fixes the review findings on this branch, reruns tests/lint/build and the size/theme
  checks, posts results on PR #4, updates this file, commits and pushes, then asks Codex to review.
  Do not merge yet. Layout polishes above are proposals, not implemented changes.
- Both real iPhones, installed home-screen app: verify haptics and record iOS versions;
  dictation in Safari and its separate home-screen installation; keyboard/safe areas;
  touch scrolling, Pee and sleep actions; close/reopen mid-session. Desktop checks do not
  satisfy the device requirement. Keep accessible names required by AGENTS.md and DESIGN.md.
- After this PR and device verification, resume prompt B (session audit, edit/delete, past
  entries, sleep exits), then accounts and sync as planned below.

## 2026-10-13 (Jason, Claude Code): phone test feedback, polish and quick fixes

Branch: `polish-and-fixes`. PRs #2 (app shell) and #3 (handoff rule) are merged to `main`.

### Phone test (Jason, iPhone 14 Pro Max)
- Works: timeline returns to newest after logging; a sleep session survives closing the app;
  nothing under the notch or home bar.
- Haptic did not fire. VoiceOver checks are dropped: the app is internal, for the two of us.

### Built on this branch (prompt A from Jason's chat, folded in with the polish)
- **Look:** Jason asked Claude to take charge using his saved resources (Raindrop, "Design
  Resources New"). Used the interfaces.dev cheat sheet (layered shadows instead of outlines,
  keys that sink when pressed) and Phosphor icons (one bold 22px icon per home key). Skipped
  the "Components" libraries (Arc UI, ObsidianUI, React Bits, Watermelon UI, Dot Matrix,
  react-spring): animated landing-page kits, wrong for a half-awake logging app.
  Darker page ground so white keys sit on it, top-lit dark keys, sunk text boxes, bigger
  status line (28px) and session timer (52px). DESIGN.md sections 3 to 7 updated.
- **Labels centred** when a key has nothing under it (Pee choices, Meal, Pee/Poop before the
  first log).
- **Timeline scrollbar hidden.**
- **Haptic now fires inside the tap,** before the save. WebKit only plays the switch haptic
  during a real tap (bug 285120). If it still doesn't fire on the phones, drop it.
- **`prototypes/dictation-test.html`:** tests whether one-tap dictation (Safari's speech
  recognition) works in an installed home-screen app. Decides how Say it works.
- Tests 17 of 17, lint, build pass. Design review: one fix (Say it icon colour).

### Next
- Codex reviews this PR. Both phones check the preview (see PR), including the dictation test
  page added to the home screen on its own.
- Then Yuykhan: **prompt B** (session audit, then edit/delete, past entries, sleep exits).
  Prompt A is done here; don't run it.
- Then piece 2 (accounts) and piece 3 (sync). Daily use starts after piece 3.

## 2026-10-11 (Yuykhan, Claude Code): review of the microphone icon

Branch: `phase1-app-shell`, pull request #2. Reviewed Codex's commit `da0e899`.
[Review posted](https://github.com/vvessels/evie/pull/2#pullrequestreview-5485825468): **no findings.**

- Measured at 390 x 844 and 320 x 568, light and dark: icon 22 x 22, 8px gap, icon and label
  centred (equal space both sides, no vertical offset), key 72px tall, exactly two columns wide,
  same position after Socialize, clear of the Pee/Poop dock. Icon follows the text colour.
- `aria-hidden="true"` on the icon; the button's text is exactly "Say it" and the test finds it
  by that name. Tapping opens Say it with the text box focused.
- `npm test` 17 of 17, lint clean, build passes (known fallback-font warning).
- DESIGN.md sections 2 to 10: clean. Non-blocking note for the phones: a microphone may suggest
  recording starts on tap; it opens a text box and you tap the keyboard's mic.
- Codex found no blocking issues in `7938378` (timeline fixes) and none in pull request #3
  (handoff rule). GitHub won't let `blackberrybun` approve #3, which she opened, so Jason
  can approve it from his account. Neither pull request is merged.

### Still pending on both real iPhones (installed home-screen app, not done)
- VoiceOver: keys read as "Say it", "Pee", "Water"; icon not announced.
- Keyboard and dictation in Say it and session notes.
- Timeline scrolling by finger, return to newest after logging, background past the 48-hour
  mark and resume.
- Safe areas (notch, home bar), haptics, storage after closing the app mid-session.

### Next
- Both phones: run the checks above on the preview link, then Jason approves and merges #3 and
  #2 (or tell Claude to merge). After #2 merges, piece 2 (accounts) starts from `main`.

## 2026-10-11 (Yuykhan, Codex): handoff-rule review

- Pulled `phase1-app-shell`: PR #2 is unchanged at `da0e899`. Its timeline review,
  microphone implementation and passing verification are recorded below; no duplicate work.
- Reviewed PR #3, `agents-handoff-prompt`, commit `f88c6da`. No findings: the prompt rule works
  for both outgoing and incoming tools and is consistent with the existing handoff rules.
  [Review posted](https://github.com/vvessels/evie/pull/3#pullrequestreview-5485817027).
- GitHub rejected formal approval because the signed-in account `blackberrybun` authored
  PR #3. Posted the clean review as a comment instead. Jason can provide formal approval
  from his account if required. No changes pushed to PR #3 and nothing merged.
- Next: Claude reviews microphone commit `da0e899` on PR #2. Real installed-iPhone checks
  below remain pending. This local progress note should be included in the next handoff commit.

## 2026-10-11 (Yuykhan, Codex): timeline follow-up review and Say it microphone

Branch: `phase1-app-shell`, [pull request #2](https://github.com/vvessels/evie/pull/2).

### Reviewed
- Reviewed Claude's `7938378` against the project rules and DESIGN.md. No blocking findings;
  [review posted](https://github.com/vvessels/evie/pull/2#issuecomment-6115468132).
- All 16 existing tests, lint and build passed. Verified return to newest after scrolling
  overflowing history, light/dark at 390 x 844 and 320 x 568, and no fade on the short screen.
- An extra temporary integration test outside the repo used the real clock hook to verify
  that returning after the 48-hour cutoff removes an expired entry without a database write,
  while an older running sleep session keeps its card.
- The prior local Codex review note was already included in Claude's `7938378`.

### Built and verified
- Added a 22px inline outline microphone left of "Say it", with an 8px gap, existing colours,
  round strokes and no fill. The key remains in its two-column position and 72px tall.
- The icon is hidden from assistive technology; the accessible name remains exactly "Say it".
  Added a test for the name, hidden icon and opening the text box. Updated DESIGN.md sections
  2 and 6 to describe the icon plus label.
- All 17 tests, lint and production build pass. The known Atkinson fallback-font warning remains.
- Production-browser checks at both sizes in light/dark confirmed 22px icon, 8px gap, centred
  contents, 72px key, inherited text colour, unchanged bathroom controls and working text entry.
- Reviewed DESIGN.md sections 2–10: bottom layout, token colours and contrast, type sizes,
  spacing/key dimensions, existing interaction, no added motion, sentence-case copy with no
  em-dashes, accessible naming/focus and no banned decorative defaults. This uses the documented
  Codex manual review path; no Claude design plugin was run.

### Next
- Claude reviews the separate microphone commit on this branch. Do not merge yet.
- Both people still need the Vercel preview installed on their real iPhones: check VoiceOver
  announces "Say it" once, icon/text readability, keyboard and dictation, finger/momentum
  timeline scrolling, return after the 48-hour cutoff, safe areas, haptics and reopening a saved
  session. Desktop checks do not establish these iPhone behaviours.

## 2026-10-11 (Yuykhan, Claude Code): fixes for Codex's three timeline findings

Branch: `phase1-app-shell`, [pull request #2](https://github.com/vvessels/evie/pull/2).
Addresses [Codex's review](https://github.com/vvessels/evie/pull/2#pullrequestreview-5485568204).

### Changed
- **New log after scrolling up:** the timeline scrolls back to the newest entry whenever a
  visible entry is added or changed (`components/Timeline.tsx`).
- **Fade on short screens:** the timeline sits in a size container (`.timeline-wrap`); the 24px
  top fade only applies when it is at least 88px tall. At 320 x 568 (26.6px tall) there is no
  fade, so the newest row keeps full contrast. Pee and Poop are unchanged.
- **48-hour cutoff:** the timeline filters by age against the ticking clock (`RECENT_MS` in
  `lib/db.ts`), so entries leave on time with no database change, and on returning to the app
  (the clock updates on `visibilitychange`). Running sessions are unaffected and keep their card.

### Verified
- `tests/timeline.test.tsx`, 7 new tests (16 of 16 pass): scroll back to newest from a scrolled-up
  position; 47h59m entry gone after two minutes of clock only; a 49-hour running session keeps its
  card; Today/Yesterday split at New York midnight across both 2026 clock changes (including the
  repeated 1:30 AM); previous-day maths across month, year and leap day; fade rule only inside
  the container query. Each of the three fix tests was confirmed to fail with its fix removed.
- `npm run lint` and `npm run build` pass (the known fallback-font warning remains).
- Desktop browser, dev server:
  - 390 x 844 with 30+ entries: scrolled up 400px, logged Water, newest row fully visible
    above the keys. A 47h59m entry disappeared within about a minute, with no save in between.
    Fade present (302px timeline).
  - 320 x 568: timeline 26.6px with no fade; newest row text fully inside it, readable in light
    and dark. Pee/Poop 116px at y=436 to 552 on home, Pee panel, and sleep settling, whining
    and out of crate.
- DESIGN.md sections 2 to 10 checked by hand. `/interface-design:design-review` still isn't
  installed on this laptop.

### Still needs checking on both real iPhones (installed home-screen app, not done yet)
- Timeline scroll and the return-to-newest after logging, by finger, with momentum scrolling.
- The fade looks right on each phone's screen size, light and dark.
- Leaving the app in the background past an entry's 48-hour mark, then reopening.
- The earlier checks: haptics, status bar colour, safe areas, keyboard with notes, storage after
  closing the app mid-session.

## 2026-10-11 (Yuykhan, Codex): review of Claude's two follow-up commits

Branch: `phase1-app-shell`. Reviewed `b629fc8` and `6ba1bbd`, after `abd31a5`, in
[pull request #2](https://github.com/vvessels/evie/pull/2#pullrequestreview-5485568204).
This was a review only. No app fixes were made or pushed; this handoff note is local.

- Posted three findings: a new log stays hidden after scrolling into older history;
  the 24px timeline fade makes the newest row hard to read at 320 x 568; entries can
  remain visible after passing the 48-hour cutoff until another database change.
- `npm test` (9 tests), `npm run lint` and `npm run build` pass. Build retains the
  previously documented fallback-font warning. Five temporary review checks outside the
  repo covered New York midnight/DST and calendar boundaries, heading changes,
  deleted/running-row exclusion, unlinked bathroom saves, and the stale-cutoff reproduction.
- Browser checks at 390 x 844 and 320 x 568 confirmed Pee/Poop stay pinned and 116px tall
  with a populated timeline, the Pee panel and a sleep session. Checked light/dark readability
  and DESIGN.md sections 2–10. No new save-loss, duplicate-save or permanent-lock issue found.

### Next
- Claude addresses the three inline findings, adds regression coverage and requests review.
- Both people test the Vercel preview as an installed home-screen app on their real iPhones
  before merge. Desktop checks do not verify iOS storage, keyboard, safe areas or haptics.
- Include this local review note in the builder's next commit.

## 2026-10-10 (Yuykhan, Claude Code): timeline on the Log screen

Branch: `phase1-app-shell` (still pull request #2). Yuykhan tried the preview: logging works.
She asked for the log to show in the empty space above the keys.
- `components/Timeline.tsx`: the last 48 hours, newest right above the keys, older entries
  scroll up and fade under the status line. "Today" / "Yesterday" headings (New York days).
  Notes show under each row, off-target in the accident colour, finished sessions as their
  summary. Running sessions stay in their card only. Read-only for now: tapping a row to edit
  is piece 4; a who-logged-it dot comes with accounts (piece 2).
- One test added (9 of 9 pass). Checked at 375px with a full day of entries.

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
