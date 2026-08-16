"use client";

import { useId, useState } from "react";

export type WeeklySeries = { day: string; incidents: number; dispatched: number };

const AXIS = "#9aa0a6";
const GRID = "#eceef0";

/** Smooths a polyline by curving through the midpoint between each pair. */
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";

  let path = `M${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const midX = (previous.x + current.x) / 2;
    path += ` Q${previous.x} ${previous.y} ${midX} ${(previous.y + current.y) / 2}`;
    path += ` Q${current.x} ${current.y} ${current.x} ${current.y}`;
  }

  return path;
}

/* ------------------------------------------------------------------ *
 * Incidents per hour
 * ------------------------------------------------------------------ */

const LINE_W = 620;
const LINE_H = 210;
const LINE_PAD = { top: 12, right: 16, bottom: 30, left: 40 };

export function IncidentsPerHourChart({ series }: { series: number[] }) {
  const gradientId = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  const incidentsPerHour = series.length === 24 ? series : new Array(24).fill(0);
  const yMax = Math.max(4, Math.ceil(Math.max(...incidentsPerHour) / 4) * 4);
  const innerW = LINE_W - LINE_PAD.left - LINE_PAD.right;
  const innerH = LINE_H - LINE_PAD.top - LINE_PAD.bottom;

  const points = incidentsPerHour.map((value, index) => ({
    x: LINE_PAD.left + (index / (incidentsPerHour.length - 1)) * innerW,
    y: LINE_PAD.top + innerH - (value / yMax) * innerH,
    value,
    index,
  }));

  const line = smoothPath(points);
  const area = `${line} L${points[points.length - 1].x} ${LINE_PAD.top + innerH} L${points[0].x} ${LINE_PAD.top + innerH} Z`;
  const active = hovered === null ? null : points[hovered];

  return (
    <section className="chart-card">
      <h2 className="chart-card__title">Incidents / Hour</h2>

      <div className="chart-card__plot">
        <svg
          viewBox={`0 0 ${LINE_W} ${LINE_H}`}
          role="img"
          aria-label="Reported incidents by hour of day"
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0080ff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0080ff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax].map((tick) => {
            const y = LINE_PAD.top + innerH - (tick / yMax) * innerH;
            return (
              <g key={tick}>
                <line
                  x1={LINE_PAD.left}
                  y1={y}
                  x2={LINE_W - LINE_PAD.right}
                  y2={y}
                  stroke={GRID}
                  strokeDasharray="3 4"
                />
                <text x={LINE_PAD.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill={AXIS}>
                  {tick}
                </text>
              </g>
            );
          })}

          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke="#0080ff" strokeWidth="2" />

          {incidentsPerHour.map((_, index) =>
            index % 2 === 0 ? (
              <text
                key={index}
                x={points[index].x}
                y={LINE_H - 8}
                textAnchor="middle"
                fontSize="10"
                fill={AXIS}
              >
                {String(index).padStart(2, "0")}
              </text>
            ) : null,
          )}

          {active && (
            <g className="chart-tooltip">
              <line
                x1={active.x}
                y1={LINE_PAD.top}
                x2={active.x}
                y2={LINE_PAD.top + innerH}
                stroke="#c9ced3"
              />
              <circle cx={active.x} cy={active.y} r="5" fill="#0080ff" stroke="#fff" strokeWidth="2" />
              <g transform={`translate(${Math.min(active.x + 12, LINE_W - 118)} ${Math.max(active.y - 42, 2)})`}>
                <rect className="chart-tooltip__box" width="104" height="42" rx="6" />
                <text x="12" y="18" fontSize="11" fontWeight="600" fill="#1a1a1a">
                  {Math.round(active.value)}
                </text>
                <text x="12" y="33" fontSize="10" fill="#0080ff">
                  Incidents : {Math.round(active.value)}
                </text>
              </g>
            </g>
          )}

          {/* Invisible hit areas keep hover tracking simple and accessible. */}
          {points.map((point) => (
            <rect
              key={point.index}
              x={point.x - innerW / (points.length - 1) / 2}
              y={LINE_PAD.top}
              width={innerW / (points.length - 1)}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHovered(point.index)}
            />
          ))}
        </svg>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Weekly resolution
 * ------------------------------------------------------------------ */

const BAR_W = 620;
const BAR_H = 230;
const BAR_PAD = { top: 12, right: 16, bottom: 34, left: 40 };

export function WeeklyResolutionChart({ data }: { data: WeeklySeries[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const weeklyResolution = data;
  const peak = Math.max(1, ...weeklyResolution.flatMap((e) => [e.incidents, e.dispatched]));
  const yMax = Math.ceil(peak / 6) * 6;
  const innerW = BAR_W - BAR_PAD.left - BAR_PAD.right;
  const innerH = BAR_H - BAR_PAD.top - BAR_PAD.bottom;
  const slot = innerW / weeklyResolution.length;
  const barWidth = 16;

  return (
    <section className="chart-card">
      <h2 className="chart-card__title">Weekly Resolution</h2>

      <div className="chart-card__plot">
        <svg
          viewBox={`0 0 ${BAR_W} ${BAR_H}`}
          role="img"
          aria-label="Incidents reported versus units dispatched, by weekday"
          onMouseLeave={() => setHovered(null)}
        >
          {[0, yMax / 4, yMax / 2, (yMax * 3) / 4, yMax].map((tick) => {
            const y = BAR_PAD.top + innerH - (tick / yMax) * innerH;
            return (
              <g key={tick}>
                <line
                  x1={BAR_PAD.left}
                  y1={y}
                  x2={BAR_W - BAR_PAD.right}
                  y2={y}
                  stroke={GRID}
                  strokeDasharray="3 4"
                />
                <text x={BAR_PAD.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill={AXIS}>
                  {tick}
                </text>
              </g>
            );
          })}

          {weeklyResolution.map((entry, index) => {
            const centre = BAR_PAD.left + slot * index + slot / 2;
            const incidentsH = (entry.incidents / yMax) * innerH;
            const resolvedH = (entry.dispatched / yMax) * innerH;
            const baseline = BAR_PAD.top + innerH;

            return (
              <g key={entry.day} onMouseEnter={() => setHovered(index)}>
                {hovered === index && (
                  <rect
                    x={centre - slot / 2}
                    y={BAR_PAD.top}
                    width={slot}
                    height={innerH}
                    fill="#f4f5f6"
                  />
                )}

                <rect
                  x={centre - barWidth - 3}
                  y={baseline - incidentsH}
                  width={barWidth}
                  height={incidentsH}
                  rx="3"
                  fill="#ef4136"
                />
                <rect
                  x={centre + 3}
                  y={baseline - resolvedH}
                  width={barWidth}
                  height={resolvedH}
                  rx="3"
                  fill="#22c55e"
                />

                <text x={centre} y={BAR_H - 12} textAnchor="middle" fontSize="10" fill={AXIS}>
                  {entry.day}
                </text>

                <rect
                  x={centre - slot / 2}
                  y={BAR_PAD.top}
                  width={slot}
                  height={innerH}
                  fill="transparent"
                />
              </g>
            );
          })}

          {hovered !== null && (
            <g
              className="chart-tooltip"
              transform={`translate(${Math.min(
                BAR_PAD.left + slot * hovered + slot / 2 + 10,
                BAR_W - 116,
              )} 24)`}
            >
              <rect className="chart-tooltip__box" width="102" height="56" rx="6" />
              <text x="12" y="18" fontSize="11" fontWeight="600" fill="#1a1a1a">
                {weeklyResolution[hovered].day}
              </text>
              <text x="12" y="34" fontSize="10" fill="#ef4136">
                Incidents : {weeklyResolution[hovered].incidents}
              </text>
              <text x="12" y="48" fontSize="10" fill="#22c55e">
                Dispatched : {weeklyResolution[hovered].dispatched}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="chart-legend">
        <span>
          <i style={{ background: "#ef4136" }} /> Incidents
        </span>
        <span>
          <i style={{ background: "#22c55e" }} /> Dispatched
        </span>
      </div>
    </section>
  );
}
