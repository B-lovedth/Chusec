/**
 * Stylised stand-in for the live map. It mirrors the composition in the design
 * (coastline, parks, graded corridors and incident markers) so the surrounding
 * chrome can be built and reviewed. Replace the whole component with the
 * Mapbox/Google layer once tiles and real geometry are available.
 */
const cities = [
  { name: "Jebu-Ode", x: 128, y: 76 },
  { name: "Ondo", x: 388, y: 62 },
  { name: "Edo", x: 636, y: 100 },
  { name: "Benin City", x: 574, y: 186 },
  { name: "Sapele", x: 588, y: 274 },
  { name: "Warri", x: 604, y: 388 },
  { name: "Delta", x: 542, y: 228 },
  { name: "Onitsha", x: 866, y: 190 },
  { name: "Nnewi", x: 812, y: 234 },
  { name: "Anambra", x: 898, y: 142 },
  { name: "Enugu", x: 1018, y: 100 },
  { name: "Nsukka", x: 1012, y: 52 },
  { name: "Ebonyi", x: 1178, y: 148 },
  { name: "Afikpo", x: 1146, y: 268 },
  { name: "Umuahia", x: 1036, y: 314 },
  { name: "Aba", x: 962, y: 372 },
  { name: "Ikot Ekpene", x: 1090, y: 372 },
  { name: "Calabar", x: 1246, y: 400 },
  { name: "Port Harcourt", x: 918, y: 464 },
  { name: "Yenagoa", x: 736, y: 422 },
  { name: "Rivers", x: 874, y: 400 },
];

export function MapCanvas() {
  return (
    <svg
      className="map-card__canvas"
      viewBox="0 0 1330 610"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Map of southern Nigeria showing graded transit corridors and incident markers"
    >
      <rect width="1330" height="610" fill="#f4f1e8" />

      {/* Gulf of Guinea */}
      <path d="M0 236C120 282 244 344 344 418c78 58 128 118 156 192H0Z" fill="#a9c9d9" />
      <path
        d="M0 236C120 282 244 344 344 418c78 58 128 118 156 192"
        stroke="#8fb3c6"
        strokeWidth="2"
        fill="none"
      />

      {/* Forest reserves */}
      <g fill="#cfe0bc">
        <path d="M404 150c56-26 118-18 150 16 28 30 10 74-38 88-58 16-124-4-142-42-14-30 2-48 30-62Z" />
        <path d="M628 292c96-40 208-30 268 22 46 40 24 104-48 128-96 32-214 4-252-52-28-42-4-76 32-98Z" />
        <path d="M1186 214c68-16 122 22 128 82 6 66-38 128-104 146-56 16-98-22-104-84-6-70 22-130 80-144Z" />
        <path d="M1258 452c40-8 66 22 58 62-8 38-44 62-78 50-30-12-34-52-14-82 10-16 20-26 34-30Z" />
      </g>

      {/* Road network */}
      <g stroke="#e3d9c6" strokeWidth="1.6" fill="none">
        <path d="M60 120c180 30 360 42 540 22s360-52 540-40" />
        <path d="M120 320c200-40 380-30 560 30s360 96 560 60" />
        <path d="M300 20c40 160 90 300 180 420s220 180 380 150" />
        <path d="M760 0c-20 180 10 340 100 460s220 140 380 120" />
        <path d="M1020 0c40 140 30 300-30 420s-160 190-300 190" />
      </g>
      <g stroke="#eec79a" strokeWidth="2.4" fill="none">
        <path d="M180 190c220 40 420 34 620-14s380-70 520-40" />
        <path d="M540 40c30 180 90 330 200 440s250 150 420 120" />
      </g>

      {/* Rivers */}
      <g stroke="#9fc3d6" strokeWidth="2" fill="none" opacity="0.9">
        <path d="M700 40c-20 130-70 250-150 340s-160 150-250 190" />
        <path d="M980 60c30 140 20 270-40 380" />
      </g>

      {/* Corridors — colour matches the legend grades */}
      <g fill="none" strokeLinecap="round">
        <path d="M275 215C520 236 780 262 1015 290" stroke="#f0483e" strokeWidth="16" opacity="0.22" />
        <path d="M275 215C520 236 780 262 1015 290" stroke="#f0483e" strokeWidth="7" />

        <path
          d="M275 215C330 200 402 186 465 175"
          stroke="#f7861b"
          strokeWidth="5"
          strokeDasharray="16 12"
        />

        <path d="M1015 290C1090 236 1170 176 1245 130" stroke="#f7861b" strokeWidth="14" opacity="0.22" />
        <path d="M1015 290C1090 236 1170 176 1245 130" stroke="#f7861b" strokeWidth="7" />

        <path
          d="M925 322C960 316 990 304 1015 290"
          stroke="#f5b70a"
          strokeWidth="5"
          strokeDasharray="15 11"
        />

        <path d="M1015 290 940 434" stroke="#16b364" strokeWidth="5" />
      </g>

      {/* Incident markers */}
      <g>
        <circle cx="275" cy="215" r="13" fill="#f0483e" />
        <circle cx="465" cy="175" r="12" fill="#ef7a1f" />
        <circle cx="925" cy="322" r="14" fill="#f5b70a" />
        <circle cx="1015" cy="290" r="13" fill="#1f2933" />
        <circle cx="1005" cy="286" r="9" fill="#ef7a1f" />

        <g fill="#ffffff" stroke="#c9d2d9" strokeWidth="1.5">
          <ellipse cx="1245" cy="130" rx="13" ry="10" />
          <ellipse cx="1085" cy="300" rx="13" ry="10" />
        </g>
        <circle cx="1245" cy="130" r="3" fill="#5f656c" />
        <circle cx="1085" cy="300" r="3" fill="#5f656c" />
      </g>

      <g fill="#7b8794" fontSize="14" fontFamily="inherit">
        {cities.map((city) => (
          <text key={city.name} x={city.x} y={city.y}>
            {city.name}
          </text>
        ))}
      </g>
    </svg>
  );
}
