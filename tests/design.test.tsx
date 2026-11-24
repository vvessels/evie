import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

// DESIGN.md section 7: animate only transform and opacity. (visibility is allowed as the instant
// switch that hides the toast after it fades; it doesn't move or draw anything.)
it('only animates transform and opacity', () => {
  const css = readFileSync('app/globals.css', 'utf8');
  const allowed = new Set(['transform', 'opacity', 'visibility', 'none']);
  const declarations = [...css.matchAll(/transition\s*:\s*([^;]+);/g)].map(m => m[1]);
  expect(declarations.length).toBeGreaterThan(0);
  for (const value of declarations) {
    for (const part of value.split(',')) {
      expect(allowed, `transition "${value.trim()}"`).toContain(part.trim().split(/\s+/)[0]);
    }
  }
});
