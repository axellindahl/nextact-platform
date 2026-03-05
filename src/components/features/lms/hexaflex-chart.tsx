"use client";

import { useEffect, useState } from "react";

type HexaflexScores = {
  values: number;
  acceptance: number;
  defusion: number;
  present_moment: number;
  self_as_context: number;
  committed_action: number;
};

type HexaflexChartProps = {
  scores: HexaflexScores;
  size?: number;
  className?: string;
  animate?: boolean;
};

const AXES: { key: keyof HexaflexScores; label: string }[] = [
  { key: "values", label: "Värderingar" },
  { key: "acceptance", label: "Acceptans" },
  { key: "defusion", label: "Defusion" },
  { key: "present_moment", label: "Närvarande" },
  { key: "self_as_context", label: "Självet" },
  { key: "committed_action", label: "Handlande" },
];

const RINGS = [25, 50, 75, 100];

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleIndex: number,
  total: number
): { x: number; y: number } {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function HexaflexChart({
  scores,
  size = 300,
  className = "",
  animate = true,
}: HexaflexChartProps) {
  const [scale, setScale] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    const frame = requestAnimationFrame(() => {
      setScale(1);
    });
    return () => cancelAnimationFrame(frame);
  }, [animate]);

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.36;
  const labelRadius = size * 0.46;
  const count = AXES.length;

  const dataPoints = AXES.map((axis, i) => {
    const value = Math.min(100, Math.max(0, scores[axis.key]));
    const radius = (value / 100) * maxRadius * scale;
    return polarToCartesian(cx, cy, radius, i, count);
  });

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
        role="img"
        aria-label="ACT hexaflex mental styrka-profil"
      >
        {/* Background rings */}
        {RINGS.map((ring) => {
          const ringPoints = Array.from({ length: count }, (_, i) =>
            polarToCartesian(cx, cy, (ring / 100) * maxRadius, i, count)
          );
          return (
            <polygon
              key={ring}
              points={ringPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-light-gray/50"
            />
          );
        })}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const end = polarToCartesian(cx, cy, maxRadius, i, count);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-light-gray/50"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="var(--color-primary)"
          fillOpacity={0.3}
          stroke="var(--color-primary)"
          strokeWidth={2}
          strokeLinejoin="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="var(--color-primary)"
            className="transition-all duration-700 ease-out"
          />
        ))}

        {/* Axis labels */}
        {AXES.map((axis, i) => {
          const pos = polarToCartesian(cx, cy, labelRadius, i, count);
          const value = scores[axis.key];
          return (
            <text
              key={axis.key}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-charcoal text-[11px] font-body"
            >
              <tspan x={pos.x} dy="-0.4em">
                {axis.label}
              </tspan>
              <tspan
                x={pos.x}
                dy="1.2em"
                className="fill-primary font-semibold text-[12px]"
              >
                {value}
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export type { HexaflexScores };
