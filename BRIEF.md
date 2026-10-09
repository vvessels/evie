# Evie app: build brief

Edit anything here before the build session starts. Phase 0 is in progress.
Last revised 2026-10-08 with Jason's and Yuykhan's workflow notes (sections 2, 5, 6, 7, 9, 12, 14).
The build session treats this file as the spec. Where it conflicts with chat, this file wins.

---

## 1. What this is

A shared puppy log for Evie, a dachshund, 9 weeks old on 2026-10-07. Two people, Jason and
Yuykhan, each log from their own phone into one shared record. Either person may
be away, so the person at home must be able to see everything the other one logged, live.

It is a real tool used several times a day during house training. Speed of logging beats
everything else. The portfolio entry is a bonus.

## 2. Success test

- Logging a pee takes **two taps and under 3 seconds** from the home screen icon: Pee, then one
  choice that holds both target and amount (e.g. "On target, medium").
- Something one of us logs shows up on the other phone within a few seconds, without a refresh.
- Both of us are still using it daily two weeks after v1 ships. If not, cut features until we are.

## 3. Stack (decided, don't re-open)

| Piece | Choice | What it is, plainly |
|---|---|---|
| App | Next.js (App Router), TypeScript | The website code. Installs to the home screen as a PWA ("progressive web app": a website that behaves like an app, own icon, no browser bar) |
| Data + logins | Supabase | Hosted database plus user accounts. Free tier |
| Live sync | Supabase Realtime | Pushes new rows to the other phone instantly |
| Hosting | Vercel | Puts the app on the internet. Free tier |
| Code location | `~/Documents/evie`, git repo, private GitHub repo | |

## 4. Two people, one log (the "separately but together" requirement)

- **Each person has their own account.** Sign-in by **email one-time code** (a 6-digit code typed
  into the app), not a magic link. Reason: on iPhone, a magic link opens in Safari, not in the
  installed home-screen app, so the login lands in the wrong place. Verify this is still true
  on a real iPhone before building around it.
- **Sign in once per phone, then never again.** After that it opens like any app: tap the icon,
  you're on the Now screen. Order matters on iPhone: add to home screen FIRST, then sign in inside
  the installed app (it keeps its own storage, separate from Safari). Sessions must not expire
  while in use. Verify on both iPhones, including after a phone restart and after a week unused.
- **One shared household.** Both accounts belong to one `household`; every event belongs to the
  household, not to a person. Database rules (Supabase "RLS", row level security: the database
  itself refuses to show rows to anyone outside the household) enforce it. Nobody else can sign
  up into it; invite-only.
- **Every event records who logged it** and shows it subtly (initial or colour dot).
- **Either person can edit or delete any event.** Edits keep `updated_by` and `updated_at`.
  Deletes are soft (hidden, recoverable) with an Undo toast, never a confirm dialog.
- **Logging after the fact is normal.** Time defaults to now, with one-tap offsets
  (now, 5m, 15m, 30m ago) and a picker for anything else.
- **Bad signal must not lose a log.** Save locally first, show it immediately, sync when online,
  mark unsynced rows quietly. Test with the phone in airplane mode.

## 5. What gets logged

Logging is 90% of the use. Every event gets a time stamp automatically, and every event can
carry an optional free-text note (typed or dictated). Photos on any event are phase 2.

**Instant events** (one or two taps):
- **Pee:** on target or off target, plus amount (small, medium, big). One tap on Pee, one tap on
  a 2 x 3 grid. "Target" means wherever she should go: the pad now, outside later. Off target is
  an accident.
- **Poop:** on target or off target. No amount for now.
- **Water:** time stamp only.
- **Meal:** how much she ate (finished, half left, barely ate) and how she ate (all at once, or
  on and off). Time stamp.

**Timed sessions** (start, stop, duration tracked automatically):
- **Sleep** is a guided flow, not a single button. Everything until Woke up stays inside it:
  1. **Settling:** we started putting her down for a nap or the night.
  2. Then **Whining** or **Fell asleep**.
  3. If Whining: **Let her out?** If no, back to step 2 (still timed).
  4. If let out: a note on what she did outside the crate (pee and poop buttons stay available
     here), then **Back in crate**, which loops to step 2.
  5. After Fell asleep: **Woke up**, which ends the flow and returns home.
  The app records how long it took her to fall asleep, how long she slept, how many whining
  rounds, and how long she was out of the crate.
- **Play:** time tracked.
- **Training:** time tracked, plus which command we practiced (free text).
- **Socialization:** time tracked, plus a description and a reflection (free text).
- **Walk:** time tracked, plus where (free text).

**Secondary records** (their own pages, not on the home screen): vet visits (with notes),
vaccines, meds, weight and size, milestones, our own questions.

**Voice entry:** saying "she peed a lot on the pad" or "she was whining for 10 minutes, we let
her out" is sorted into the same categories and fields as the buttons. The app shows what it
understood and saves on one tap, so a wrong guess never lands in the log silently. With no
signal, the sentence is kept and sorted once the phone is back online.

## 6. Screens

1. **Log** (home, opens by default). Built for logging, nothing else competes:
   - One quiet status line at the top: time since last pee and poop, and whether she's asleep.
   - **Pee and Poop side by side, pinned to the bottom edge**, the largest targets. They stay in
     that exact spot in every state, including inside sessions, so the thumb learns one place.
     (Changed 2026-10-09 from "at the top", after Yuykhan picked the Codex alternative.)
   - Above them, equal size and weight: **Meal, Water, Sleep, Walk, Play, Training,
     Socialization**.
   - A **Voice** button on the same screen.
   - While a timed session runs (above all Sleep), the home screen shows that session's next
     steps and a running clock, with Pee and Poop still reachable.
   - After every log: drawn-check confirmation, then an Undo toast with time offsets.
2. **Records** (one tap away, never the default). Today and past days, filter by type, tap any
   event to edit. Counts per day and week.
3. **Evie.** Profile, weight and size history, vaccines and vet visits with notes, milestones,
   the schedule we follow.
4. **Ask.** Type or dictate a question; see section 9b.
5. **Guidance.** The knowledge base the app's advice comes from, each line with its source. No
   invented intervals: every number (e.g. how long a puppy her age can hold it) must cite a named
   expert source (vet association, published trainer, AKC, etc.) and be checked at the source. If
   a claim can't be sourced, it doesn't ship.

## 7. Design direction

Used several times a day, often one-handed, half-awake, holding a puppy. It should feel calm,
fast, and nice to touch.

Process (from Jason's originality rule: the first idea is the genre average):
1. Load the `design-refs` skill (Jason's taste and anti-preferences), `interface-design`,
   and `frontend-design` before designing anything.
2. **Banned defaults:** pastel card grid with emoji buttons, a cartoon paw logo, generic
   "pet app" mint and coral, dashboard stat tiles, entrance animations.
3. Produce **3 distinct directions as clickable static prototypes** of the Now screen
   (real phone width, real-looking data). Jason and Yuykhan pick one together. She is a
   daily user, so her vote counts as much as his.
   **Picked 2026-10-08: direction C (Handoff) for colours, type and feel.** Its layout is not
   used; layout and flow follow sections 5 and 6. `DESIGN.md` holds the result.
   **Layout picked 2026-10-09: Codex's alternative 1**, now `prototypes/log.html`.
4. Starting vocabulary from his taxonomy, to combine, not copy: `tech-forward` (precise,
   satisfying micro-interaction), `tactile` (taps feel weighted and confirmed), `restrained-motion`
   (short, eased, felt not watched), `archival` (the log is a dated record that accumulates).
5. Interaction must-haves: big targets, instant visual confirmation on every log (the drawn-check
   feedback Jason likes), haptics where iOS allows it (verify on device, don't assume),
   readable at night (dark mode that's actually comfortable at 3am, not just inverted).
6. Before calling v1 done, run `interface-design:design-review` and fix what it finds.

## 8. Importing her existing logs

Her history is in one long claude.ai chat. A summary of a long chat is not data.
- **Raw source:** the chat's share link (read in the browser while signed in to claude.ai).
  A share link is a snapshot from when it was shared, so she re-shares right before import.
- **Cross-check:** her chat's own structured extract, using the prompt in
  `exports/evie-handoff-prompt.md` (part 2 only; part 1, the full account export, is no longer needed).
- The build session extracts events from the raw chat itself, diffs against her extract, lists
  every mismatch for us to resolve, then imports. The raw transcript wins.
- Imported rows are marked `source: import` so they're distinguishable forever.

## 9. Phases

| Phase | Ships | Target |
|---|---|---|
| 0 | Repo, Supabase project, design prototypes, pick, DESIGN.md, workflow prototype tried on both phones | Day 1 to 2 |
| 1 | Login, shared household, Log home screen, all instant events and timed sessions (incl. the sleep flow), edit/delete, live sync, offline queue, installed on both phones | Weekend 1 |
| 2 | Voice entry, Records, Evie page (vet, vaccines, weight, milestones), import of her logs, photos | Week 2 |
| 3 | Ask (log answers, then research), Guidance knowledge base, pattern flags | Week 3 |
| Later | Content planning for posting her | After v1 is in daily use |

**No automated reports.** Answers on request, any time. Voice entry and Ask use the Claude API
(the paid service the app calls to send text to Claude). Jason creates the account at
console.anthropic.com; it's billed separately from either Claude plan. The API key (the app's
secret password for that service) lives in `.env.local` and Vercel only.

## 9b. Ask, research and pattern flags

Questions come typed or dictated: "has she done this before?", "how many accidents this week?",
"is this normal?", "she's whining more at naps, what should we change?".

**Accuracy is the requirement.** A confident wrong answer is the worst outcome, worse than
"I don't know".
- **From her log:** questions about what happened are answered by querying the log itself, with
  the matching entries shown under the answer so it can be checked at a glance. Counts and times
  are computed, never estimated by the model.
- **From the knowledge base (verified):** advice and "is this normal" answers draw on Guidance
  entries, each with a named source that was checked at the source. Shown as verified, with the
  source.
- **From research (not yet checked):** if Guidance doesn't cover it, Claude searches, prefers
  primary authoritative sources (veterinary associations, vet schools, AKC, board-certified
  behaviourists, peer-reviewed work) over blogs and forums, quotes what each source actually
  says, and links it. Marked "Not yet checked" until one of us confirms it, then it can be added
  to Guidance. If sources disagree or are thin, the answer says so.
- Anything that sounds like a health problem says to call the vet, and never replaces one.
- Vet visit notes can get a short summary of what the visit means, built the same way:
  her log plus verified Guidance first, research second, each marked.

**Pattern flags:** the app notices when something is different from her usual (an accident at a
time she's normally dry, a much shorter nap, eating less over several meals) and marks it in
Records. Schedule suggestions come from her own patterns ("pees within 10 minutes of waking, 9
times out of 10") plus verified Guidance, never invented intervals.

## 10. Working rules for the build session

- Teach as you go: Jason is a designer catching up on dev. Define terms the first time, say what
  each command did. He should be able to redeploy alone by the end.
- Jason creates accounts himself (Supabase, Vercel, GitHub). Claude walks him through and
  never enters passwords. Secret keys live in `.env.local` and in Vercel, never in git.
- Verify on real phones, both of ours, before calling anything done. A desktop browser isn't proof.
- No em-dashes in any UI copy.
- One session per phase; run `wrapup` at the end of each.

## 11. Facts

- Users: Jason and Yuykhan. (Contact details are kept out of this repo because it's public.)
- Phones: both iPhone. Target iOS Safari home-screen apps only; no Android work.
- Time zone: America/New_York for all times and day boundaries.

## 12. Building it together (usage limits)

- GitHub repo is the shared ground. Both are collaborators. Vercel deploys automatically on every
  push: `main` is the live app, every branch gets its own preview link. Preview links are
  password-protected by Vercel by default, so either switch that protection off for previews or
  add Yuykhan to the Vercel project; verify she can open one on her phone.
- Whoever is building reads this brief plus `PROGRESS.md` (the build session keeps it updated:
  what's done, what's next, gotchas). Any session, either person, either tool, can pick up from there.
- One builder at a time per phase, on a branch, merged by pull request. Never two agents editing
  the same files at once.
- Who: Jason leads phase 0 on his Pro plan. Yuykhan runs phases 1 and 2 on her own laptop on her
  Max plan, Jason helping lead. Never share account logins.
- **Either tool can build: Claude Code or Codex.** Both read `AGENTS.md`, and the repo carries
  everything else (`BRIEF.md`, `DESIGN.md`, `PROGRESS.md`). Whichever tool did NOT build a change
  reviews its pull request. Switching tools mid-phase is fine, following the handoff rule in
  `AGENTS.md`: the outgoing tool commits, pushes and updates PROGRESS.md before the other starts.
  Codex doesn't load the Claude plugins, which is why `DESIGN.md` must be complete on its own.
- Build sessions start inside the repo folder, never in Jason's vault. The vault is private notes;
  the repo is shared code, and a code project's `node_modules` (thousands of files) would bog
  down Obsidian.
- **Repo `CLAUDE.md` carries the shared rules**, because Yuykhan's Claude doesn't have Jason's
  global instructions: read BRIEF.md and PROGRESS.md first, no em-dashes in UI copy, verify on
  real iPhones, teach Jason as you go, never enter passwords.
- **Repo `.claude/settings.json` turns off plugins this project doesn't use** (Shopify, marketing,
  productivity, etc.) so their tool and skill listings aren't loaded every turn. Measure context
  before and after to confirm it worked.
- `import/` holds Yuykhan's exported log and profile. It is in `.gitignore` (kept out of git); she
  already has her own copies.

## 13. Tooling that travels with the repo (phase 0 builds this)

Yuykhan's Claude is a plain setup: no vault, no Jason's skills, no GitHub yet. So everything a
build session needs must live **inside the repo**, where it reaches her laptop on every pull.

| File | What it does |
|---|---|
| `AGENTS.md` | The rules every AI agent follows on this project. Codex reads this file by name. |
| `CLAUDE.md` | One line, `@AGENTS.md`, so Claude reads the same rules. One source, no drift. |
| `DESIGN.md` | The design source of truth, written after the phase 0 pick: the chosen direction, colour and type tokens, spacing, motion timings, interaction rules, banned defaults, accessibility rules (contrast, 44pt targets, VoiceOver labels). Distilled from Jason's `design-refs` taste file, so her sessions get his taste without his whole library. |
| `PROGRESS.md` | What's done, what's next, gotchas. Updated at the end of every session, by whoever ran it. |
| `.claude/settings.json` | Declares the plugins below so Claude offers to install them when she opens the project, and turns off unrelated ones. |
| `SETUP.md` | The step-by-step for getting both laptops ready. |

**Plugins to declare (installable on any machine, all public on GitHub):**
- `interface-design`: craft rules, `design-review` (strict review with an approval bar), `design-deslop` (strips the generic AI look). Required before any UI change merges.
- `frontend-design` (Anthropic official): visual direction and polish.
- `design-engineer`: Next.js, TypeScript, Tailwind and motion engineering standards. Matches this stack.
- `andrej-karpathy-skills`: coding discipline, avoids common AI coding mistakes.

**Left out on purpose:** taste-skill, perception-first-design, design-for-ai, img2threejs, intent
(portfolio or 3D oriented, heavy always-on cost), Shopify, marketing, productivity, Figma.
Jason's full `design-refs` library stays on his machine; `DESIGN.md` carries what applies.

**Verify, don't assume:** that declaring plugins in project settings actually prompts install on
her laptop, and that project settings can switch off his globally enabled plugins. Test both on
the real machines and record the result in PROGRESS.md.

## 14. Every iteration, same loop

1. Pull latest. Read AGENTS.md, DESIGN.md, PROGRESS.md.
2. Make a branch for the change (a separate line of work that doesn't touch the live app).
3. Build. UI changes run `design-review` and fix findings before moving on.
4. Check it on a real iPhone using the preview link Vercel makes for every branch.
5. Open a pull request. **The other tool reviews it** (Codex reviews Claude's work, Claude
   reviews Codex's), against AGENTS.md and DESIGN.md. The builder addresses the review.
6. Merge: the live app updates. Update PROGRESS.md.
Small fixes follow the same loop. No editing `main` directly.
