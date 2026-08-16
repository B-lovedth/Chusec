"use client";

import { Minus, Plus } from "lucide-react";
import { MapCanvas } from "@/components/dashboard/MapCanvas";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { mapCallout, type CommandIncident } from "@/data/admin";

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

      <div className="map-popup" style={{ left: "56%", top: "6%" }}>
        <p className="map-popup__meta">
          {mapCallout.reference} · {mapCallout.time}
        </p>
        <h3 className="map-popup__title">{mapCallout.title}</h3>
        <p className="map-popup__location">{mapCallout.location}</p>
        <p className="map-popup__note">{mapCallout.note}</p>
        <div style={{ marginTop: 10 }}>
          <SeverityBadge severity={mapCallout.severity} />
        </div>
        <span className="map-popup__tail" aria-hidden="true" />
      </div>

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
