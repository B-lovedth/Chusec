"use client";

import { useMemo } from "react";
import { Minus, Plus } from "lucide-react";
import { CorridorLegend } from "@/components/dashboard/CorridorLegend";
import { MapCanvas } from "@/components/dashboard/MapCanvas";
import { MapboxMap, MAPBOX_TOKEN, type MapMarker } from "@/components/map/MapboxMap";
import { toCorridorLine, toSeverity } from "@/lib/mappers";
import type { NearbyIncidentResponse, TransitCorridorResponse } from "@/services/types";

const markerColor: Record<string, string> = {
  Critical: "#ef4136",
  High: "#f7861b",
  Medium: "#f5b70a",
  Low: "#16b364",
};

type MapCardProps = {
  userLocation: { lat: number; lon: number } | null;
  incidents: NearbyIncidentResponse[];
  corridors?: TransitCorridorResponse[];
  /** Pans the map to this incident; set by the Nearby Incidents list. */
  selectedIncidentId?: string | null;
  onSelectIncident?: (id: string) => void;
};

export function MapCard({
  userLocation,
  incidents,
  corridors = [],
  selectedIncidentId = null,
  onSelectIncident,
}: MapCardProps) {
  // Only corridors the backend has given geometry for produce a line.
  const lines = useMemo(
    () => corridors.map(toCorridorLine).filter((line): line is NonNullable<typeof line> => line !== null),
    [corridors],
  );

  const markers = useMemo<MapMarker[]>(() => {
    const incidentMarkers: MapMarker[] = incidents.map((incident) => {
      const severity = toSeverity(incident.severity);

      return {
        id: String(incident.id),
        lat: incident.lat,
        lon: incident.lon,
        color: markerColor[severity] ?? "#ef4136",
        selected: String(incident.id) === selectedIncidentId,
        label: `${incident.type} — ${incident.distance_formatted} ${incident.cardinal_direction}`,
        tooltip: {
          badge: severity,
          badgeColor: markerColor[severity],
          title: incident.type,
          lines: [
            incident.location_name,
            [incident.distance_formatted, incident.cardinal_direction].filter(Boolean).join(" "),
            incident.time_formatted,
          ],
        },
      };
    });

    if (!userLocation) return incidentMarkers;

    return [
      {
        id: "you",
        lat: userLocation.lat,
        lon: userLocation.lon,
        color: "#0080ff",
        isUser: true,
        label: "Your location",
        tooltip: { title: "You are here" },
      },
      ...incidentMarkers,
    ];
  }, [incidents, userLocation, selectedIncidentId]);

  return (
    <div className="map-card">
      {MAPBOX_TOKEN ? (
        // Centred on the citizen rather than fitted to every marker. 17 is the
        // *tightest* the view goes — it widens to hold any corridor geometry,
        // since at street level the lines would all be off-screen.
        <MapboxMap
          markers={markers}
          lines={lines}
          focus={userLocation}
          focusZoom={17}
          onSelect={onSelectIncident}
        />
      ) : (
        <>
          <MapCanvas />

          <div className="map-zoom">
            <button type="button" aria-label="Zoom in">
              <Plus size={16} strokeWidth={2.2} />
            </button>
            <button type="button" aria-label="Zoom out">
              <Minus size={16} strokeWidth={2.2} />
            </button>
          </div>
        </>
      )}

      <CorridorLegend />
    </div>
  );
}
