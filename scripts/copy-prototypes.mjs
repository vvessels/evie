// Copies prototypes/ into public/prototypes/ before every build, so the design prototypes
// stay viewable at /prototypes/log.html on Vercel next to the real app.
// The copy is generated, so it's in .gitignore; edit the files in prototypes/.
import { cpSync, rmSync } from 'node:fs';

rmSync('public/prototypes', { recursive: true, force: true });
cpSync('prototypes', 'public/prototypes', { recursive: true });
