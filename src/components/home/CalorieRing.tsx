import React from "react";

const CIRCUMFERENCE = 2 * Math.PI * 52; // ≈ 326.73
const ARC_LENGTH = 62;
const GAP = CIRCUMFERENCE - ARC_LENGTH; // ≈ 264.73
const QUARTER = CIRCUMFERENCE / 4; // ≈ 81.68

const SEGMENTS = [
  { key: "protein", color: "#0d9488", offset: -5, overPositive: true },
  { key: "fat", color: "#f59e0b", offset: -(5 + QUARTER), overPositive: false },
  { key: "carbs", color: "#ec4899", offset: -(5 + QUARTER * 2), overPositive: false },
  { key: "water", color: "#38bdf8", offset: -(5 + QUARTER * 3), overPositive: true },
] as const;

interface CalorieRingProps {
  caloriesConsumed: number;
  caloriesGoal: number;
  proteinPct: number;
  fatPct: number;
  carbsPct: number;
  waterPct: number;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  caloriesConsumed,
  caloriesGoal,
  proteinPct,
  fatPct,
  carbsPct,
  waterPct,
}) => {
  const pcts = [proteinPct, fatPct, carbsPct, waterPct];
  const isOverGoal = caloriesConsumed > caloriesGoal;

  return (
    <svg
      width={130}
      height={130}
      viewBox="0 0 130 130"
      style={{ overflow: "visible" }}
    >
      {SEGMENTS.map((seg, i) => {
        const pct = pcts[i];
        const clampedPct = Math.min(pct, 1);
        const fillDash = ARC_LENGTH * clampedPct;
        const fillGap = CIRCUMFERENCE - fillDash;
        const isOver = pct > 1;

        let filter: string | undefined;
        let animation: string | undefined;

        if (isOver) {
          if (seg.overPositive) {
            filter = "drop-shadow(0 0 5px rgba(34,197,94,0.5))";
          } else {
            filter = "drop-shadow(0 0 6px rgba(239,68,68,0.7))";
            animation = "opacityPulse 2s ease-in-out infinite";
          }
        }

        return (
          <g key={seg.key}>
            {/* Track arc */}
            <circle
              cx={65}
              cy={65}
              r={52}
              fill="none"
              stroke="var(--ring-track)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${ARC_LENGTH} ${GAP}`}
              strokeDashoffset={seg.offset}
              transform="rotate(-90 65 65)"
            />
            {/* Fill arc */}
            <circle
              cx={65}
              cy={65}
              r={52}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${fillDash} ${fillGap}`}
              strokeDashoffset={seg.offset}
              transform="rotate(-90 65 65)"
              style={{ filter, animation }}
            />
          </g>
        );
      })}

      {/* Center text */}
      <text
        x={65}
        y={61}
        textAnchor="middle"
        fontSize={22}
        fontWeight="bold"
        fill={isOverGoal ? "#ef4444" : "var(--text-primary)"}
        style={
          isOverGoal
            ? { filter: "drop-shadow(0 0 8px rgba(239,68,68,0.3))" }
            : undefined
        }
      >
        {caloriesConsumed.toLocaleString()}
      </text>
      <text
        x={65}
        y={76}
        textAnchor="middle"
        fontSize={10}
        fill="var(--text-muted)"
      >
        / {caloriesGoal.toLocaleString()} cal
      </text>
    </svg>
  );
};

export default CalorieRing;
