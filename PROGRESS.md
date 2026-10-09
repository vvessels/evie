# Progress

Updated at the end of every build session by whoever ran it.

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
