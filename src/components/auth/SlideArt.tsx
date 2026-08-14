import type { OnboardingSlide, SlideTone } from "@/data/onboarding";

const toneColor: Record<SlideTone, string> = {
  critical: "#f0483e",
  high: "#f7861b",
  medium: "#f5b70a",
  low: "#16b364",
};

const gridColumns = [20, 80, 140, 200, 260, 320];
const gridRows = [8, 68, 128, 188];

type SlideArtProps = {
  art: OnboardingSlide["art"];
};

/** Warning glyph used inside the callout bubbles. */
function WarningMark({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round">
      <path d="M6 0.8 11.2 10.2H0.8Z" />
      <path d="M6 4.2v3" strokeLinecap="round" />
      <path d="M6 8.6h0.01" strokeLinecap="round" />
    </g>
  );
}

export function SlideArt({ art }: SlideArtProps) {
  const primary = toneColor[art.primary.tone];
  const secondary = toneColor[art.secondary.tone];

  return (
    <svg
      className="promo-slide__art"
      viewBox="0 0 380 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="rgba(255,255,255,0.32)" strokeWidth="1">
        {gridColumns.map((x) => (
          <line key={`c-${x}`} x1={x} y1={gridRows[0]} x2={x} y2={gridRows[gridRows.length - 1]} />
        ))}
        {gridRows.map((y) => (
          <line key={`r-${y}`} x1={gridColumns[0]} y1={y} x2={gridColumns[gridColumns.length - 1]} y2={y} />
        ))}
      </g>

      <path
        d="M-5 265C55 258 105 245 150 218c55-32 105-68 218-98"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="10 11"
      />

      <circle cx="93" cy="244" r="14" fill="rgba(240,72,62,0.28)" />
      <circle cx="93" cy="244" r="8" fill={primary} />

      <circle cx="294" cy="143" r="15" fill="rgba(255,255,255,0.3)" />
      <circle cx="294" cy="143" r="9" fill={secondary} />

      <g transform="rotate(-4 77 195)">
        <path d="M70 206h18l-12 18Z" fill="#fff" />
        <rect x="18" y="172" width="122" height="40" rx="10" fill="#fff" />
        <WarningMark x={33} y={182} color={primary} />
        <text x="53" y="197" fill={primary} fontSize="14" fontWeight="600" fontFamily="inherit">
          {art.primary.label}
        </text>
      </g>

      <g transform="rotate(-8 287 94)">
        <path d="M282 106h14l-9 14Z" fill="#fff" />
        <rect x="230" y="78" width="116" height="30" rx="8" fill="#fff" />
        <WarningMark x={241} y={87} color={secondary} />
        <text x="258" y="98" fill={secondary} fontSize="11.5" fontWeight="600" fontFamily="inherit">
          {art.secondary.label}
        </text>
      </g>
    </svg>
  );
}
