import { CorridorLegend } from "@/components/dashboard/CorridorLegend";

export function MapCard() {
  return (
    <div className="map-card">
      <div className="map-card__canvas" aria-label="Route map">
        <div className="map-card__zoom-controls" aria-label="Map zoom controls">
          <button type="button" aria-label="Zoom in">+</button>
          <button type="button" aria-label="Zoom out">−</button>
        </div>

        <div className="map-card__route map-card__route--primary" />
        <div className="map-card__route map-card__route--secondary" />
        <div className="map-card__route map-card__route--warm" />

        <div className="map-card__marker map-card__marker--start" />
        <div className="map-card__marker map-card__marker--mid" />
        <div className="map-card__marker map-card__marker--end" />

        <div className="map-card__map-overlay" />
      </div>

      <CorridorLegend />
    </div>
  );
}
