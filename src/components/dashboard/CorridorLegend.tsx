export function CorridorLegend() {
  return (
    <div className="corridor-legend" aria-label="Corridor legend">
      <span className="corridor-legend__title">CORRIDORS</span>
      <div className="corridor-legend__list">
        <div className="legend-item">
          <span className="legend-line legend-line--critical" />
          <span>CRITICAL</span>
        </div>
        <div className="legend-item">
          <span className="legend-line legend-line--high" />
          <span>HIGH</span>
        </div>
        <div className="legend-item">
          <span className="legend-line legend-line--medium" />
          <span>MEDIUM</span>
        </div>
        <div className="legend-item">
          <span className="legend-line legend-line--low" />
          <span>LOW</span>
        </div>
      </div>
    </div>
  );
}
