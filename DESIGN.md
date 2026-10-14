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
  Socialize, and a **microphone icon plus Say it** (voice) spanning two columns. The 22px
  outline icon sits left of the label with an 8px gap, both centred in the 72px-tall key.
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
| `--ground` | `#ebeae5` | `#121110` | Page background (a step darker than the keys, so they sit on it) |
| `--surface` | `#ffffff` | `#262421` | Keys, cards, toast |
| `--ink` | `#17191c` | `#ece8e2` | Primary text |
| `--ink-2` | `#4a4e55` | `#b9b3aa` | Secondary text |
| `--ink-3` | `#5f636b` | `#938c83` | Meta, hints, times |
| `--line` | `rgba(23,25,28,.08)` | `rgba(236,232,226,.08)` | Soft edges |
| `--line-2` | `rgba(23,25,28,.18)` | `rgba(236,232,226,.16)` | Key and input edges, timeline separators |
| `--key` / `--key-ink` | `#17191c` / `#f2f2ef` | `#423d37` / `#ece8e2` | Pee, Poop, primary actions. Filled with `--key-fill`, a top-lit gradient (`#2d3035` to `#17191c`; dark `#4d4842` to `#3a3631`) |
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
  26 (Pee/Poop), 28 (status line, 800 weight), 52 (session timer, 800 weight).
- **Icons:** Phosphor (`@phosphor-icons/react`), bold weight, 22px, in `--ink-2`, above the label
  on the home grid and left of the label on wide keys (Say it). One per key, so a key can be found
  by shape. Pee and Poop stay text only. Never reuse the night toggle's moon on a key.
- Hierarchy comes from weight and colour as much as size: labels 700, meta 500 in `--ink-3`.
- Sentence case. No all-caps labels.

## 5. Spacing, shape, depth

- 8px base. Gaps between keys 8px. Section gaps 24 to 28px.
- Radii: keys 16px, session card 20px, handoff line 14px, segmented control 14px outer / 10px inner.
- Depth: layered shadows, not outlines (from Jason's saved interfaces.dev cheat sheet).
  `--depth-1` for keys and cards (hairline, short contact shadow, soft long shadow, 1px top
  highlight); `--depth-press` when a key is held down (it sinks into the page);
  `--depth-key` for the dark keys (lit from above); `--depth-float` for the toast and the save
  error; `--well` for text boxes and the meal toggle track (sunk into the page). Values in
  `app/globals.css`. Dark mode has its own values, never inverted.
- A label with nothing under it is centred in its key. The time line under a label only renders
  when there's a time (no reserved empty space).
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
- **Voice (microphone icon plus Say it):** opens a text box with the keyboard up; the person
  taps the keyboard's mic. The icon is hidden from assistive technology, so the key's name
  stays "Say it". The app shows "Got it as ..." and saves on one tap. Never saves a guess silently.
- **Haptics:** iOS Safari has no vibration API. The app toggles a hidden
  `<input type="checkbox" switch>`, which plays a system haptic on iOS 18+, but only inside the
  tap itself (WebKit bug 285120), so `haptic()` runs before any `await`. It did not fire on Jason's
  phone when it ran after the save (2026-10-13). If it still doesn't fire, drop it: the press and
  the drawn check carry the confirmation.
- Notes can be typed or dictated wherever a text box appears; drafts survive tapping Pee or
  Poop mid-session.

## 7. Motion

- Easing: `cubic-bezier(.23, 1, .32, 1)` for everything.
- Press: `scale(0.97)` over 160ms; the shadow switches to `--depth-press` immediately (not animated). Check draw: 260ms. Toast in/out: 200ms. Records sheet: 260ms.
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
