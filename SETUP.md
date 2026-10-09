# Getting set up

Plain steps, no prior experience needed. Anything that asks for a password: you type it
yourself. Claude never does.

## Yuykhan (about 20 minutes, once)

1. **Make a GitHub account** at github.com. GitHub stores the app's code online so both laptops
   share it. Send Jason your username.
2. **Accept Jason's invite** to the `evie` repository (the project's code folder on GitHub).
   It arrives by email from GitHub.
3. **Install the Claude desktop app** (claude.ai/download) and sign in with your Max account.
   Open the **Code** tab. That's Claude Code: Claude that can work with files on your laptop.
   No terminal needed.
4. **Start your first session.** Choose your Documents folder, then paste:
   > Clone the evie repo from GitHub into this folder, then read SETUP.md and AGENTS.md and get
   > me ready to build. Explain each step in plain words.

   Claude will set up GitHub on your laptop. Expect a browser window asking you to approve
   GitHub access, and possibly a Mac popup offering to install "command line developer tools":
   click Install.
5. **When Claude asks to trust the folder and install the project's plugins, say yes.** Those
   are the design and coding skills this project runs on.
6. **Connect Codex to GitHub** so it reviews every change: in Codex (chatgpt.com/codex),
   connect your GitHub account, pick the `evie` repo, and turn on code review. Claude can walk
   you through the current screens.

## Jason (phase 0 does this with you)

1. Create the GitHub repo and invite Yuykhan as a collaborator.
2. Create the Supabase and Vercel accounts and connect Vercel to the repo.
3. Commit AGENTS.md, CLAUDE.md, DESIGN.md, PROGRESS.md and `.claude/settings.json`.

## Starting any build session after that

Open the Claude desktop app, Code tab, choose the `evie` folder, and say:
> Pull the latest, read AGENTS.md, DESIGN.md and PROGRESS.md, then continue with what's next.

## Switching between Claude Code and Codex

Either one can build, at any stage. GitHub is the handoff: whatever isn't pushed doesn't exist
for the other tool. The full rule is in `AGENTS.md`, "Switching between Claude Code and Codex".

**Ending a session in either tool**, say:
> Commit and push what you have, and update PROGRESS.md with the branch name, what's half done,
> and what's next.

**Starting in Codex** (chatgpt.com/codex, `evie` repo selected), say:
> Read AGENTS.md, BRIEF.md, DESIGN.md and PROGRESS.md. Then [the task]. Work on a new branch
> and open a pull request.

**Starting in Claude Code** after Codex worked, say:
> Pull the latest. Read AGENTS.md, DESIGN.md and PROGRESS.md. Check out the branch PROGRESS.md
> names and continue.

**Asking Codex for design prototypes:**
> Read AGENTS.md, BRIEF.md and DESIGN.md, and open prototypes/log.html to see the current
> logging screen. Make [N] alternative prototypes of [what], as new files in prototypes/ named
> codex-[name].html, each loading prototypes/shared.js for Evie's data. [Follow DESIGN.md / or:
> explore a different look]. Open a pull request.

To see a prototype on your phone, open the Vercel preview link GitHub shows on the pull request,
then add `/prototypes/[file].html` to the end of the address.

The tool that didn't build a change reviews its pull request: Claude reviews Codex's, Codex
reviews Claude's.
