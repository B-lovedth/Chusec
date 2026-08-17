"use client";

import { useEffect, useRef } from "react";
import { Crosshair } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/** Delta State, roughly centred on the corridors the app tracks. */
export const DEFAULT_CENTER: [number, number] = [5.95, 5.75];
export const DEFAULT_ZOOM = 7.2;

export type MapMarker = {
  id: string;
  lat: number;
  lon: number;
  color: string;
  selected?: boolean;
  label?: string;
  /** The citizen's own position — drawn as a pulsing dot, not an incident. */
  isUser?: boolean;
  /** Shown on hover, and on tap where there is no hover. */
  tooltip?: MarkerTooltip;
};

export type MarkerTooltip = {
  title: string;
  /** Secondary lines, e.g. "1.2 km NE · 14:32". Falsy entries are skipped. */
  lines?: (string | null | undefined)[];
  /** Rendered as a coloured chip above the title. */
  badge?: string;
  badgeColor?: string;
};

/**
 * Built as DOM nodes with `textContent` rather than `setHTML` — incident types
 * and location names are user-supplied, so string interpolation into HTML
 * would be an injection hole.
 */
function buildTooltip(tooltip: MarkerTooltip): HTMLElement {
  const root = document.createElement("div");
  root.className = "map-tip__body";

  if (tooltip.badge) {
    const badge = document.createElement("span");
    badge.className = "map-tip__badge";
    badge.textContent = tooltip.badge;
    if (tooltip.badgeColor) {
      badge.style.color = tooltip.badgeColor;
      badge.style.borderColor = tooltip.badgeColor;
    }
    root.appendChild(badge);
  }

  const title = document.createElement("p");
  title.className = "map-tip__title";
  title.textContent = tooltip.title;
  root.appendChild(title);

  (tooltip.lines ?? []).filter(Boolean).forEach((line) => {
    const row = document.createElement("p");
    row.className = "map-tip__line";
    row.textContent = String(line);
    root.appendChild(row);
  });

  return root;
}

export type MapLine = {
  id: string;
  coordinates: [number, number][];
  color: string;
  name: string;
};

const CORRIDOR_SOURCE = "corridors";
const CORRIDOR_HALO_LAYER = "corridors-halo";
const CORRIDOR_LINE_LAYER = "corridors-line";

type MapboxMapProps = {
  markers?: MapMarker[];
  /** Graded transit corridors drawn beneath the markers. */
  lines?: MapLine[];
  onSelect?: (id: string) => void;
  /** Re-fits the view to the markers whenever this changes. Ignored when `focus` is set. */
  fitToMarkers?: boolean;
  /** Centres on a fixed point instead of fitting bounds — the citizen's own position. */
  focus?: { lat: number; lon: number } | null;
  focusZoom?: number;
  className?: string;
};

export function MapboxMap({
  markers = [],
  lines = [],
  onSelect,
  fitToMarkers = true,
  focus = null,
  focusZoom = 13,
  className = "mapbox-canvas",
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markerRefs = useRef<import("mapbox-gl").Marker[]>([]);
  const popupRefs = useRef<import("mapbox-gl").Popup[]>([]);
  const hasFocusedRef = useRef(false);
  const focusLat = focus?.lat ?? null;
  const focusLon = focus?.lon ?? null;
  // Held in a ref so marker click handlers always call the latest callback
  // without the markers having to be rebuilt when it changes identity.
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Create the map once. mapbox-gl touches `window`, so it is imported here
  // rather than at module scope.
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;

    let cancelled = false;
    let map: import("mapbox-gl").Map | null = null;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      if (cancelled || !containerRef.current) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");
      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      popupRefs.current.forEach((popup) => popup.remove());
      popupRefs.current = [];
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Corridor polylines, drawn as a GeoJSON layer under the markers. Sources
  // can only be added once the style has loaded.
  useEffect(() => {
    if (!MAPBOX_TOKEN) return;

    let cancelled = false;

    const draw = () => {
      const map = mapRef.current;
      if (cancelled || !map) return;

      const data = {
        type: "FeatureCollection" as const,
        features: lines.map((line) => ({
          type: "Feature" as const,
          properties: { color: line.color, name: line.name },
          geometry: { type: "LineString" as const, coordinates: line.coordinates },
        })),
      };

      const existing = map.getSource(CORRIDOR_SOURCE);

      if (existing) {
        (existing as import("mapbox-gl").GeoJSONSource).setData(data);
        return;
      }

      map.addSource(CORRIDOR_SOURCE, { type: "geojson", data });

      // Halo underneath so the grade reads against busy street tiles.
      map.addLayer({
        id: CORRIDOR_HALO_LAYER,
        type: "line",
        source: CORRIDOR_SOURCE,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ["get", "color"], "line-width": 12, "line-opacity": 0.22 },
      });

      map.addLayer({
        id: CORRIDOR_LINE_LAYER,
        type: "line",
        source: CORRIDOR_SOURCE,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ["get", "color"], "line-width": 4, "line-opacity": 0.95 },
      });
    };

    const map = mapRef.current;

    if (map?.isStyleLoaded()) {
      draw();
    } else {
      // The map may not exist yet on first run; poll briefly for it.
      const timer = window.setInterval(() => {
        if (cancelled) return;
        if (mapRef.current?.isStyleLoaded()) {
          window.clearInterval(timer);
          draw();
        }
      }, 200);

      return () => {
        cancelled = true;
        window.clearInterval(timer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [lines]);

  // Re-render markers whenever the incident set or selection changes.
  useEffect(() => {
    if (!MAPBOX_TOKEN) return;

    let cancelled = false;

    import("mapbox-gl").then(({ default: mapboxgl }) => {
      const map = mapRef.current;
      if (cancelled || !map) return;

      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      popupRefs.current.forEach((popup) => popup.remove());
      popupRefs.current = [];

      markers.forEach((marker) => {
        const element = document.createElement("button");
        element.type = "button";
        element.className = [
          "mapbox-marker",
          marker.isUser ? "is-user" : "",
          marker.selected ? "is-selected" : "",
        ]
          .filter(Boolean)
          .join(" ");
        element.style.setProperty("--marker", marker.color);
        if (marker.label) element.setAttribute("aria-label", marker.label);
        if (marker.tooltip) {
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 16,
            className: "map-tip",
            focusAfterOpen: false,
          }).setDOMContent(buildTooltip(marker.tooltip));

          const show = () => popup.setLngLat([marker.lon, marker.lat]).addTo(map);
          const hide = () => popup.remove();

          element.addEventListener("mouseenter", show);
          element.addEventListener("mouseleave", hide);
          // Touch devices have no hover, so a tap toggles it instead.
          element.addEventListener("focus", show);
          element.addEventListener("blur", hide);

          popupRefs.current.push(popup);
        }

        element.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current?.(marker.id);
        });

        markerRefs.current.push(
          new mapboxgl.Marker({ element }).setLngLat([marker.lon, marker.lat]).addTo(map),
        );
      });

      // A focus point wins over bounds-fitting: the citizen map is about where
      // *you* are, not about framing every incident in the state.
      if (focusLat !== null && focusLon !== null) {
        const center: [number, number] = [focusLon, focusLat];

        if (hasFocusedRef.current) {
          map.easeTo({ center, zoom: focusZoom, duration: 600 });
        } else {
          // First fix — jump so there is no long fly-in from the default view.
          hasFocusedRef.current = true;
          map.jumpTo({ center, zoom: focusZoom });
        }
        return;
      }

      if (!fitToMarkers || markers.length === 0) return;

      if (markers.length === 1) {
        map.easeTo({ center: [markers[0].lon, markers[0].lat], zoom: 11, duration: 600 });
        return;
      }

      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach((marker) => bounds.extend([marker.lon, marker.lat]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 12, duration: 600 });
    });

    return () => {
      cancelled = true;
    };
    // Depends on the coordinates, not the object — callers routinely pass a
    // fresh `{lat, lon}` each render, which would otherwise rebuild every
    // marker and re-ease the camera on every tick.
  }, [markers, fitToMarkers, focusLat, focusLon, focusZoom]);

  const recentre = () => {
    if (focusLat === null || focusLon === null) return;
    mapRef.current?.easeTo({ center: [focusLon, focusLat], zoom: focusZoom, duration: 500 });
  };

  return (
    <div className="mapbox-shell">
      <div ref={containerRef} className={className} />

      {focusLat !== null && focusLon !== null && (
        <button type="button" className="mapbox-recentre" onClick={recentre}>
          <Crosshair size={15} strokeWidth={2} />
          Recentre
        </button>
      )}
    </div>
  );
}
