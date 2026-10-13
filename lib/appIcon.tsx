import { ImageResponse } from 'next/og';

// Placeholder app icon drawn in code: the dark key colour with "Evie" in the ground colour.
// No paw, per DESIGN.md banned defaults. Swap for a designed icon any time.
export function evieIcon(px: number) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#17191c', color: '#f2f2ef', fontSize: px * 0.3, fontWeight: 700, letterSpacing: -px * 0.006 }}>
        Evie
      </div>
    ),
    { width: px, height: px },
  );
}
