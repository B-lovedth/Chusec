import { Minus, Plus } from "lucide-react";
import { CorridorLegend } from "@/components/dashboard/CorridorLegend";
import { MapCanvas } from "@/components/dashboard/MapCanvas";

export function MapCard() {
  return (
    <div className="map-card">
      <MapCanvas />

      <div className="map-zoom">
        <button type="button" aria-label="Zoom in">
          <Plus size={16} strokeWidth={2.2} />
        </button>
        <button type="button" aria-label="Zoom out">
          <Minus size={16} strokeWidth={2.2} />
        </button>
      </div>

      <CorridorLegend />
    </div>
  );
}
