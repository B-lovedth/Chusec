import type { OnboardingSlide, SlideTone } from "@/data/onboarding";

const toneColor: Record<SlideTone, string> = {
  critical: "#f0483e",
  high: "#f7861b",
  medium: "#f5b70a",
  low: "#16b364",
};

const gridColumns = [20, 80, 140, 200, 260, 320];
const gridRows = [8, 68, 128, 188];

const stroke = "rgba(255,255,255,0.62)";

/** Warning glyph used inside the corridor callout bubbles. */
function WarningMark({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth="1.2" fill="none" strokeLinejoin="round">
      <path d="M6 0.8 11.2 10.2H0.8Z" />
      <path d="M6 4.2v3" strokeLinecap="round" />
      <path d="M6 8.6h0.01" strokeLinecap="round" />
    </g>
  );
}

function CorridorArt({ callouts }: { callouts: OnboardingSlide["callouts"] }) {
  const primary = toneColor[callouts?.primary.tone ?? "critical"];
  const secondary = toneColor[callouts?.secondary.tone ?? "high"];

  return (
    <>
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
        <text x="53" y="197" fill={primary} fontSize="14" fontWeight="600">
          {callouts?.primary.label}
        </text>
      </g>

      <g transform="rotate(-8 287 94)">
        <path d="M282 106h14l-9 14Z" fill="#fff" />
        <rect x="230" y="78" width="116" height="30" rx="8" fill="#fff" />
        <WarningMark x={241} y={87} color={secondary} />
        <text x="258" y="98" fill={secondary} fontSize="11.5" fontWeight="600">
          {callouts?.secondary.label}
        </text>
      </g>
    </>
  );
}

/** Radar rings and crosshair around a miniature SOS button. */
function PanicArt() {
  return (
    <g transform="translate(190 130)">
      <g stroke={stroke} fill="none">
        <circle r="118" strokeOpacity="0.35" />
        <circle r="92" strokeOpacity="0.45" />
        <circle r="66" strokeOpacity="0.6" />
      </g>

      <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
        <path d="M0-130v-22" />
        <path d="M0 130v22" />
        <path d="M-130 0h-22" />
        <path d="M130 0h22" />
        <path d="M-88-88l-14-14" />
        <path d="M88-88l14-14" />
      </g>

      <circle r="46" fill="rgba(255,255,255,0.16)" stroke={stroke} strokeWidth="1.4" />
      <text textAnchor="middle" y="-2" fill="#f0483e" fontSize="21" fontWeight="700" letterSpacing="1">
        SOS
      </text>
      <text textAnchor="middle" y="16" fill="rgba(255,255,255,0.75)" fontSize="9" letterSpacing="2">
        CLICK
      </text>

      <text textAnchor="middle" y="182" fill="rgba(255,255,255,0.85)" fontSize="13" letterSpacing="0.6">
        5.5167°N 5.7500°E → CMD
      </text>
    </g>
  );
}

/** Phone showing three graded alerts, with a broadcast arc beside it. */
function AlertsArt() {
  const rows = [
    { y: 46, color: "#f0483e" },
    { y: 106, color: "#f7861b" },
    { y: 166, color: "#16b364" },
  ];

  return (
    <g transform="translate(96 26)">
      <rect x="0" y="0" width="152" height="248" rx="20" stroke={stroke} strokeWidth="2" fill="none" />

      {rows.map((row) => (
        <g key={row.y}>
          <rect
            x="18"
            y={row.y}
            width="116"
            height="44"
            rx="8"
            fill="rgba(255,255,255,0.14)"
            stroke={row.color}
            strokeOpacity="0.55"
          />
          <circle cx="34" cy={row.y + 15} r="5" fill={row.color} />
          <rect x="46" y={row.y + 11} width="70" height="6" rx="3" fill={row.color} fillOpacity="0.85" />
          <rect x="46" y={row.y + 25} width="52" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
        </g>
      ))}

      <g stroke={stroke} strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M188 86a44 44 0 0 1 0 68" />
        <path d="M204 66a70 70 0 0 1 0 108" strokeOpacity="0.45" />
      </g>
    </g>
  );
}

/** Shield enclosing a padlock. */
function AnonymousArt() {
  return (
    <g transform="translate(190 148)">
      <path
        d="M0-108 78-78v66C78 30 44 76 0 94-44 76-78 30-78-12v-66L0-108Z"
        stroke={stroke}
        strokeWidth="2.4"
        fill="rgba(255,255,255,0.08)"
        strokeLinejoin="round"
      />
      <rect
        x="-30"
        y="-14"
        width="60"
        height="52"
        rx="12"
        fill="rgba(255,255,255,0.16)"
        stroke={stroke}
        strokeWidth="2"
      />
      <path d="M-16-14v-16a16 16 0 0 1 32 0v16" stroke={stroke} strokeWidth="2" fill="none" />
      <circle cy="8" r="6" fill="rgba(255,255,255,0.85)" />
      <path d="M0 12v10" stroke="rgba(255,255,255,0.85)" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  );
}

type SlideArtProps = {
  slide: OnboardingSlide;
};

export function SlideArt({ slide }: SlideArtProps) {
  return (
    <svg
      className="promo-slide__art"
      viewBox="0 0 380 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fontFamily="inherit"
    >
      {slide.art === "corridor" && <CorridorArt callouts={slide.callouts} />}
      {slide.art === "panic" && <PanicArt />}
      {slide.art === "alerts" && <AlertsArt />}
      {slide.art === "anonymous" && <AnonymousArt />}
    </svg>
  );
}
