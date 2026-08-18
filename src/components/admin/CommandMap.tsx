"use client";

import { useMemo } from "react";
import { Minus, Plus } from "lucide-react";
import { MapCanvas } from "@/components/dashboard/MapCanvas";
import { MapboxMap, MAPBOX_TOKEN, type MapMarker } from "@/components/map/MapboxMap";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import type { CommandIncident, SecurityUnit } from "@/data/admin";

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
  /** Response units with known coordinates, drawn as squares. */
  units?: SecurityUnit[];
};

export function CommandMap({ incidents, selectedId, onSelect, units = [] }: CommandMapProps) {
  const callout = incidents.find((incident) => incident.id === selectedId) ?? incidents[0] ?? null;

  const markers = useMemo<MapMarker[]>(
    () =>
      incidents
        .filter((incident) => incident.coordinates !== null)
        .map((incident) => ({
          id: incident.id,
          lat: incident.coordinates!.lat,
          lon: incident.coordinates!.lon,
          color: markerColor[incident.severity] ?? "#ef4136",
          selected: incident.id === selectedId,
          label: `${incident.title} — ${incident.location}`,
          tooltip: {
            badge: incident.severity,
            badgeColor: markerColor[incident.severity],
            title: incident.title,
            lines: [incident.location, `${incident.reference} · ${incident.time}`],
          },
        })),
    [incidents, selectedId],
  );

  const unitMarkers = useMemo<MapMarker[]>(
    () =>
      units
        .filter((unit) => unit.lat !== null && unit.lon !== null)
        .map((unit) => ({
          id: `unit-${unit.id}`,
          lat: unit.lat as number,
          lon: unit.lon as number,
          color: unit.isActive ? "#16b364" : "#9aa0a6",
          kind: "unit" as const,
          label: `Unit: ${unit.name}`,
          tooltip: {
            badge: unit.isActive ? "Unit · available" : "Unit · offline",
            badgeColor: unit.isActive ? "#16b364" : "#9aa0a6",
            title: unit.name,
            lines: [unit.callsign, unit.agency, unit.phone],
          },
        })),
    [units],
  );

  const useMapbox = Boolean(MAPBOX_TOKEN);

  return (
    <div className="command-map">
      {useMapbox ? (
        <MapboxMap markers={[...markers, ...unitMarkers]} onSelect={onSelect} />
      ) : (
        <>
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
              style={
                {
                  left: `${incident.point.x}%`,
                  top: `${incident.point.y}%`,
                  "--marker": markerColor[incident.severity] ?? "#ef4136",
                } as React.CSSProperties
              }
              onClick={() => onSelect(incident.id)}
              aria-label={`${incident.title} — ${incident.location}`}
            />
          ))}
        </>
      )}

      {callout && (
        <div className="map-popup map-popup--pinned">
          <p className="map-popup__meta">
            {callout.reference} · {callout.time}
          </p>
          <h3 className="map-popup__title">{callout.title}</h3>
          <p className="map-popup__location">{callout.location}</p>
          <p className="map-popup__note">{callout.narrative}</p>
          <div className="map-popup__badge">
            <SeverityBadge severity={callout.severity} />
          </div>
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

        {/* Spells out the shape rule, so a square is never read as an incident. */}
        <div className="heat-legend__shapes">
          <div className="legend-item">
            <span className="legend-key legend-key--incident" aria-hidden="true" />
            <span>INCIDENT</span>
          </div>
          <div className="legend-item">
            <span className="legend-key legend-key--unit" aria-hidden="true" />
            <span>UNIT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
