"use client";

import { useMemo, useState } from "react";
import { TRAINING_ACCENT, CHART_GRIDLINE } from "./chart-tokens";

interface RpeTrendChartProps {
  points: { date: Date; avgRpe: number }[];
}

const WIDTH = 600;
const HEIGHT = 180;
const PAD_LEFT = 28;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export function RpeTrendChart({ points }: RpeTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const yMin = 5;
  const yMax = 10;
  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const step = points.length > 1 ? plotW / (points.length - 1) : 0;

  const coords = useMemo(
    () =>
      points.map((p, i) => ({
        x: PAD_LEFT + i * step,
        y:
          PAD_TOP + plotH * (1 - (Math.min(Math.max(p.avgRpe, yMin), yMax) - yMin) / (yMax - yMin)),
      })),
    [points, step, plotH],
  );

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${PAD_TOP + plotH} L${coords[0].x.toFixed(1)},${PAD_TOP + plotH} Z`
      : "";

  const gridValues = [6, 8, 10];

  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg || coords.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    coords.forEach((c, i) => {
      const dist = Math.abs(c.x - relativeX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  const hovered =
    hoverIndex != null ? { point: points[hoverIndex], coord: coords[hoverIndex] } : null;
  const dateLabel = (d: Date) =>
    new Date(d).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });

  const tooltipWidth = 92;
  const tooltipX = hovered
    ? Math.min(Math.max(hovered.coord.x - tooltipWidth / 2, 2), WIDTH - tooltipWidth - 2)
    : 0;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="overflow-visible"
      role="img"
      aria-label="Тренд середнього RPE по сесіях"
    >
      {gridValues.map((v) => {
        const y = PAD_TOP + plotH * (1 - (v - yMin) / (yMax - yMin));
        return (
          <g key={v}>
            <line
              x1={PAD_LEFT}
              y1={y}
              x2={WIDTH - PAD_RIGHT}
              y2={y}
              stroke={CHART_GRIDLINE}
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-zinc-500 text-[9px] font-mono"
            >
              {v}
            </text>
          </g>
        );
      })}

      {areaPath && <path d={areaPath} fill={TRAINING_ACCENT} opacity={0.1} />}
      <path
        d={linePath}
        fill="none"
        stroke={TRAINING_ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {coords.length > 0 && (
        <>
          <circle
            cx={coords[coords.length - 1].x}
            cy={coords[coords.length - 1].y}
            r={4}
            fill={TRAINING_ACCENT}
            stroke="#1c1c1e"
            strokeWidth={2}
          />
          <text
            x={coords[coords.length - 1].x}
            y={coords[coords.length - 1].y - 10}
            textAnchor="end"
            className="fill-zinc-200 text-[10px] font-mono font-semibold"
          >
            {points[points.length - 1].avgRpe.toFixed(1)}
          </text>
        </>
      )}

      {points.length > 0 && (
        <>
          <text
            x={coords[0].x}
            y={HEIGHT - 6}
            textAnchor="start"
            className="fill-zinc-500 text-[9px] font-mono"
          >
            {dateLabel(points[0].date)}
          </text>
          <text
            x={coords[coords.length - 1].x}
            y={HEIGHT - 6}
            textAnchor="end"
            className="fill-zinc-500 text-[9px] font-mono"
          >
            {dateLabel(points[points.length - 1].date)}
          </text>
        </>
      )}

      {hovered && (
        <g pointerEvents="none">
          <line
            x1={hovered.coord.x}
            y1={PAD_TOP}
            x2={hovered.coord.x}
            y2={PAD_TOP + plotH}
            stroke={CHART_GRIDLINE}
            strokeWidth={1}
          />
          <circle
            cx={hovered.coord.x}
            cy={hovered.coord.y}
            r={5}
            fill={TRAINING_ACCENT}
            stroke="#1c1c1e"
            strokeWidth={2}
          />
          <rect
            x={tooltipX}
            y={Math.max(hovered.coord.y - 38, 2)}
            width={tooltipWidth}
            height={30}
            rx={6}
            fill="rgba(20,20,22,0.95)"
            stroke="rgba(255,255,255,0.1)"
          />
          <text
            x={tooltipX + 8}
            y={Math.max(hovered.coord.y - 38, 2) + 12}
            className="fill-zinc-400 text-[8px] font-mono"
          >
            {dateLabel(hovered.point.date)}
          </text>
          <text
            x={tooltipX + 8}
            y={Math.max(hovered.coord.y - 38, 2) + 24}
            className="fill-zinc-100 text-[10px] font-mono font-semibold"
          >
            RPE {hovered.point.avgRpe.toFixed(1)}
          </text>
        </g>
      )}

      <rect
        x={PAD_LEFT}
        y={0}
        width={plotW}
        height={HEIGHT}
        fill="transparent"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
      />
    </svg>
  );
}
