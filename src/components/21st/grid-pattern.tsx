// Grid Pattern — based on Magic UI / Aceternity UI pattern.
// A subtle SVG grid background for hero sections.
// No dependencies. Pure CSS/SVG.

type GridPatternProps = {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: [number, number][];
  className?: string;
};

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  squares = [],
  className = "",
}: GridPatternProps) {
  const id = "grid-pattern";

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {squares.map(([sx, sy], i) => (
        <rect
          strokeWidth="0"
          key={`square-${i}`}
          width={width - 1}
          height={height - 1}
          x={sx * width + 1}
          y={sy * height + 1}
          fill="currentColor"
          opacity="0.08"
        />
      ))}
    </svg>
  );
}
