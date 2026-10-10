// Drawn checkmark: an SVG tick whose stroke draws itself in 260ms (DESIGN.md section 6).
export default function Check({ size = 20 }: { size?: number }) {
  return (
    <svg className="drawn-check" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 12.5l4.6 4.6L19.5 6.8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
    </svg>
  );
}
