"use client";

import React from "react";
import { LanguageSphere } from "@/app/generated/prisma";

interface Stat {
  sphere: LanguageSphere;
  mastery: number; // 0 to 100
}

interface LanguageRadarChartProps {
  stats: Stat[];
  size?: number;
}

const sphereLabels: Record<LanguageSphere, string> = {
  [LanguageSphere.VOCABULARY]: "Vocab",
  [LanguageSphere.LISTENING]: "Listen",
  [LanguageSphere.READING]: "Read",
  [LanguageSphere.SPEAKING]: "Speak",
  [LanguageSphere.WRITING]: "Write",
};

export function LanguageRadarChart({ stats, size = 300 }: LanguageRadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.7; // Leave space for labels
  const angleStep = (Math.PI * 2) / 5;

  // Calculate points for the stats
  const points = stats.map((stat, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const value = Math.max(10, stat.mastery); // Minimum 10% for visibility
    const x = center + radius * (value / 100) * Math.cos(angle);
    const y = center + radius * (value / 100) * Math.sin(angle);
    return { x, y, label: sphereLabels[stat.sphere], angle };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(" ");

  // Background polygons (levels)
  const levels = [20, 40, 60, 80, 100];

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg width={size} height={size} className="overflow-visible">
        {/* Level circles/polygons */}
        {levels.map((level) => {
          const levelPoints = stats.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * (level / 100) * Math.cos(angle);
            const y = center + radius * (level / 100) * Math.sin(angle);
            return `${x},${y}`;
          }).join(" ");
          
          return (
            <polygon
              key={level}
              points={levelPoints}
              fill="none"
              stroke="currentColor"
              className="text-border/40"
              strokeWidth="1"
            />
          );
        })}

        {/* Axes */}
        {points.map((p, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              className="text-border/40"
              strokeWidth="1"
            />
          );
        })}

        {/* The data polygon */}
        <polygon
          points={pointsString}
          fill="rgba(192, 132, 252, 0.4)"
          stroke="var(--color-violet)"
          strokeWidth="2"
          className="transition-all duration-1000 ease-out"
        />

        {/* Dots at points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="var(--color-violet)"
            className="transition-all duration-1000 ease-out"
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => {
          const labelRadius = radius + 25;
          const lx = center + labelRadius * Math.cos(p.angle);
          const ly = center + labelRadius * Math.sin(p.angle);
          
          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-bold fill-muted uppercase tracking-wider"
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
