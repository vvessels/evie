# Evie: design source of truth

Read this before any UI change, by any tool. It is complete on its own: Codex doesn't load the
Claude design plugins, so everything that matters is written here.

Reference build: `prototypes/log.html`, Yuykhan's pick (made with Codex, 2026-10-09). Open
`prototypes/index.html` to see it beside the earlier versions. Where this file and the
prototype disagree, this file wins.

## 1. Direction

**C, Handoff** (picked by Jason and Yuykhan, 2026-10-08) for colour, type and feel. Calm,
legible, and quietly shared between two people. Layout and flow follow BRIEF.md sections 5 and 6.

Who it's for: one of us, half awake, often at night, holding a squirming puppy with one hand.
So: big targets low on the screen, nothing to read twice, every tap confirmed.

Taste in four words (Jason's vocabulary):
- **tech-forward:** precise, engineered, satisfying micro-interactions.
- **tactile:** taps feel weighted and confirmed (press scale, drawn check, haptic).
- **restrained-motion:** short and eased, felt rather than watched. No entrance animations.
- **archival:** the log is a dated record that accumulates. Records reads like a record.

## 2. Layout rules

- **Home is for logging.** Status at the top is quiet; the controls sit in the bottom half,
  anchored to the bottom edge (the thumb zone).
- **Pee and Poop side by side, pinned to the bottom edge** (largest, dark keys). They never
  move: same spot on the home screen, inside every session, inside the sleep loop.
- Above them, a 3-column grid of equal keys: Meal, Water, Sleep, Walk, Play, Training,
  Socialize, and **Say it** (voice) spanning two columns.
- **Every flow opens in the same spot as the buttons it replaced.** Your thumb never travels to
  the top of the screen to finish a log.
- A running session (sleep, walk, play, training, socialization) replaces the grid with its own
  card and next-step buttons, above the pinned Pee and Poop. Sleep shows the current decision,
  the stage timer, the whining-round count and the total.
- Records is one tap away (top right), never the default screen.
- One column, max width 430px, 16px side gutter, respects iPhone safe areas.

## 3. Colour tokens

Neutral, near-white ground with true-ish black ink. Two person colours: Jason slate, Yuykhan a
deepened version of Evie's cream patch. One semantic colour: off target (accidents).
Colour carries meaning only: who logged it, off target, something running live.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ground` | `#f2f2ef` | `#151413` | Page background |
| `--surface` | `#ffffff` | `#1f1d1b` | Keys, cards, toast |
| `--ink` | `#17191c` | `#ece8e2` | Primary text |
| `--ink-2` | `#4a4e55` | `#b9b3aa` | Secondary text |
| `--ink-3` | `#676b74` | `#938c83` | Meta, hints, times |
| `--line` | `rgba(23,25,28,.10)` | `rgba(236,232,226,.09)` | Soft edges |
| `--line-2` | `rgba(23,25,28,.20)` | `rgba(236,232,226,.18)` | Key and input edges |
| `--key` / `--key-ink` | `#17191c` / `#f2f2ef` | `#2e2a26` / `#ece8e2` | Pee, Poop, primary actions |
| `--jason` | `#4c6884` | `#95afc8` | Jason's dot and side of the spine |
| `--yuykhan` | `#8a5a24` | `#d8a96d` | Yuykhan's dot, Undo, live session pulse |
| `--off` | `#b23a2a` | `#e2826f` | Off target (accidents) only |

Every text colour above passes 4.5:1 contrast on both `--ground` and `--surface`, in both
themes (checked 2026-10-09; Codex caught that the first values didn't). Recheck if you change one.

**Dark mode is designed, not inverted.** At 3am nothing on screen is bright: primary keys go to a
warm dark (`--key` dark), never a light block. Follow the phone's setting, with a manual toggle.

## 4. Type

- **Atkinson Hyperlegible Next** (Google Fonts), weights 400 to 800, fallback `system-ui`.
  Chosen because it was designed for legibility at low vision: right for half-awake reading.
  Its slashed zero is a feature; keep it.
- `font-variant-numeric: tabular-nums` everywhere, so times and timers don't jitter.
- Scale: 13 (meta), 15 (secondary), 17 (key labels, body), 22 (panel titles),
  26 (Pee/Poop), 34 (status line), 44 (session timer).
- Hierarchy comes from weight and colour as much as size: labels 700, meta 500 in `--ink-3`.
- Sentence case. No all-caps labels.

## 5. Spacing, shape, depth

- 8px base. Gaps between keys 8px. Section gaps 24 to 28px.
- Radii: keys 16px, session card 20px, handoff line 14px, segmented control 14px outer / 10px inner.
- Depth: one strategy, a hairline ring plus a whisper of shadow
  (`0 0 0 1px var(--line-2), 0 1px 2px rgba(0,0,0,.05)`). Dark keys have no ring.
- Key heights: Pee/Poop 116px, standard 72px, choice keys in flows 96px. **Nothing tappable under
  44 x 44pt.**

## 6. Interaction rules

- **Pee is two taps:** Pee, then one cell of a 2 x 3 grid (On target / Off target x Small /
  Medium / Big). Off target row is in `--off`.
- **Poop is two taps:** Poop, then On target or Off target.
- **Meal is two taps:** Meal, then how much (Finished / Half left / Barely ate). "All at once /
  On and off" is a toggle above, defaulting to All at once.
- **Water is one tap.**
- **Sessions:** start with one tap; a live clock runs; next steps are big buttons; End saves.
  Sleep follows the guided loop in BRIEF.md section 5. Every step is time-stamped automatically.
- **Confirmation on every log:** the key fills dark and a check draws itself (260ms), then a
  toast at the top: what was logged, Undo, and time offsets (Now, 5m, 15m, 30m ago).
  After a session ends, the toast shows its summary ("Slept 1 hr 10 min, took 10 min to fall
  asleep, whined once").
- **Undo, never confirm dialogs.** Deletes are soft.
- **Voice (Say it):** opens a text box with the keyboard up; the person taps the keyboard's
  mic. The app shows "Got it as ..." and saves on one tap. Never saves a guess silently.
- **Haptics:** iOS Safari has no vibration API. The prototype toggles a hidden
  `<input type="checkbox" switch>`, which plays a system haptic on iOS 18+. Unverified on a
  device; verify before relying on it.
- Notes can be typed or dictated wherever a text box appears; drafts survive tapping Pee or
  Poop mid-session.

## 7. Motion

- Easing: `cubic-bezier(.23, 1, .32, 1)` for everything.
- Press: `scale(0.97)`, 120ms. Check draw: 260ms. Toast in/out: 200ms. Records sheet: 260ms.
- Animate only `transform` and `opacity`. No entrance animations, nothing on scroll.
- `prefers-reduced-motion`: the check appears drawn, nothing moves.

## 8. Copy

- No em-dashes anywhere in the UI. Use a comma, period or colon.
- Plain words from our side of the screen: "On target", "Off target", "Let her out",
  "Back in crate", "Woke up". Buttons say exactly what happens.
- Durations: "1 hr 38 min" in sentences, "1h 38m" on keys, `1:10:00` for live timers.
- Times: "8:52 PM", America/New_York.

## 9. Accessibility

- Text contrast at least 4.5:1 against its background in both themes; meta text included.
- Icon-only buttons have `aria-label` (Cancel, night toggle, voice). Grid choices whose visible
  label is ambiguous get a full label ("Pee off target, small").
- Live status and the toast use `aria-live` / `role="status"`.
- Visible focus ring: 2px `--ink`, 2px offset.

## 10. Banned defaults

Pastel card grids with emoji buttons. Cartoon paw logos. Pet-app mint and coral. Dashboard stat
tiles. Entrance animations. Warm cream with a serif and terracotta accent. Near-black with one
neon accent. Uppercase tracked eyebrow labels. Arrows appended to button text. Middle-dot meta
strings. Colour used for decoration.

## 11. Before a UI change merges

1. Check it against this file.
2. Claude sessions: run `/interface-design:design-review` and fix what it finds.
   Codex sessions: review against sections 2 to 10 above, and list what was checked in the PR.
3. Try it on both iPhones from the Vercel preview link, in light and dark.
