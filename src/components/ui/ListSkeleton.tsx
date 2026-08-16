type ListSkeletonProps = {
  rows: number;
};

export function ListSkeleton({ rows }: ListSkeletonProps) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }, (_, index) => (
        <div className="list-row" key={index}>
          <div className="list-row__lead">
            <span className="skeleton skeleton--dot" />
            <div>
              <span className="skeleton skeleton--title" />
              <span className="skeleton skeleton--meta" />
            </div>
          </div>
          <span className="skeleton skeleton--badge" />
        </div>
      ))}
    </div>
  );
}
