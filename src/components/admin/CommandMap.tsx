"use client";

import { Minus, Plus } from "lucide-react";
import { MapCanvas } from "@/components/dashboard/MapCanvas";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import type { CommandIncident } from "@/data/admin";

const grades = ["critical", "high", "medium", "low"] as const;

const markerColor: Record<string, string> = {
  Critical: "#ef4136",
  High: "#f7861b",
  Medium: "#f5b70a",
  Low: "#16b364",
};

type CommandMapProps = {
  incidents: CommandIncident[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function CommandMap({ incidents, selectedId, onSelect }: CommandMapProps) {
  // The callout tracks the selected incident rather than being pinned.
  const callout = incidents.find((incident) => incident.id === selectedId) ?? incidents[0] ?? null;

  return (
    <div className="command-map">
      <MapCanvas showOverlays={false} />

      <div className="map-zoom">
        <button type="button" aria-label="Zoom in">
          <Plus size={16} strokeWidth={2.2} />
        </button>
        <button type="button" aria-label="Zoom out">
          <Minus size={16} strokeWidth={2.2} />
        </button>
      </div>

      {incidents.map((incident) => (
        <button
          type="button"
          key={incident.id}
          className={incident.id === selectedId ? "map-marker is-selected" : "map-marker"}
          style={{
            left: `${incident.point.x}%`,
            top: `${incident.point.y}%`,
            "--marker": markerColor[incident.severity] ?? "#ef4136",
          } as React.CSSProperties}
          onClick={() => onSelect(incident.id)}
          aria-label={`${incident.title} — ${incident.location}`}
        />
      ))}

      {callout && (
        <div
          className="map-popup"
          style={{
            // Sits above the marker, nudged inside the edges of the map.
            left: `${Math.min(Math.max(callout.point.x - 6, 2), 52)}%`,
            top: `${Math.max(callout.point.y - 42, 4)}%`,
          }}
        >
          <p className="map-popup__meta">
            {callout.reference} · {callout.time}
          </p>
          <h3 className="map-popup__title">{callout.title}</h3>
          <p className="map-popup__location">{callout.location}</p>
          <p className="map-popup__note">{callout.narrative}</p>
          <div className="map-popup__badge">
            <SeverityBadge severity={callout.severity} />
          </div>
          <span className="map-popup__tail" aria-hidden="true" />
        </div>
      )}

      <div className="heat-legend" aria-label="Polygon heat legend">
        <span className="heat-legend__title">POLYGON HEAT</span>
        <div className="heat-legend__list">
          {grades.map((grade) => (
            <div className="legend-item" key={grade}>
              <span className={`legend-line legend-line--${grade}`} aria-hidden="true" />
              <span>{grade.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
