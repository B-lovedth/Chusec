const grades = ["critical", "high", "medium", "low"] as const;

export function CorridorLegend() {
  return (
    <div className="corridor-legend" aria-label="Corridor severity legend">
      <span className="corridor-legend__title">CORRIDORS</span>

      <div className="corridor-legend__list">
        {grades.map((grade) => (
          <div className="legend-item" key={grade}>
            <span className={`legend-line legend-line--${grade}`} aria-hidden="true" />
            <span>{grade.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
