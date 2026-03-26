import { Droplet } from "lucide-react";

export interface MacroColumnProps {
  proteinConsumed: number;
  proteinGoal: number;
  fatConsumed: number;
  fatGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  waterMl: number;
  waterGoalMl: number;
}

export function MacroColumn({
  proteinConsumed,
  proteinGoal,
  fatConsumed,
  fatGoal,
  carbsConsumed,
  carbsGoal,
  waterMl,
  waterGoalMl,
}: MacroColumnProps) {
  const macros = [
    {
      label: "P",
      color: "#0d9488",
      consumed: proteinConsumed,
      goal: proteinGoal,
      unit: "g",
      overPositive: true,
    },
    {
      label: "F",
      color: "#f59e0b",
      consumed: fatConsumed,
      goal: fatGoal,
      unit: "g",
      overPositive: false,
    },
    {
      label: "C",
      color: "#ec4899",
      consumed: carbsConsumed,
      goal: carbsGoal,
      unit: "g",
      overPositive: false,
    },
    {
      label: "water",
      color: "#38bdf8",
      consumed: waterMl,
      goal: waterGoalMl,
      unit: "L",
      overPositive: true,
    },
  ];

  return (
    <div className="flex flex-col gap-[7px]">
      {macros.map((macro, index) => {
        const isOver = macro.consumed > macro.goal;
        const progressPercent = Math.min(macro.consumed / macro.goal, 1) * 100;

        let valueColor = macro.color;
        let rowShadow: string | undefined;

        if (isOver) {
          if (macro.overPositive) {
            valueColor = "#22c55e";
            rowShadow =
              "0 0 10px rgba(34,197,94,0.25), inset 0 0 0 1px rgba(34,197,94,0.12)";
          } else {
            valueColor = "#ef4444";
            rowShadow =
              "0 0 10px rgba(239,68,68,0.3), inset 0 0 0 1px rgba(239,68,68,0.15)";
          }
        }

        const formatValue = () => {
          if (macro.unit === "L") {
            return `${(macro.consumed / 1000).toFixed(1)}/${(macro.goal / 1000).toFixed(1)}L`;
          }
          return `${Math.round(macro.consumed)}/${macro.goal}g`;
        };

        return (
          <div
            key={index}
            style={{
              padding: "6px 10px",
              borderRadius: "10px",
              background: "color-mix(in srgb, var(--text-primary) 6%, transparent)",
              boxShadow: rowShadow,
            }}
            className="flex items-center gap-[10px]"
          >
            {/* Label */}
            <div
              style={{ color: macro.color, fontWeight: "bold", fontSize: "10px" }}
              className="flex items-center justify-center min-w-[16px]"
            >
              {macro.label === "water" ? (
                <Droplet size={12} />
              ) : (
                <span>{macro.label}</span>
              )}
            </div>

            {/* Progress Bar */}
            <div
              style={{
                height: "5px",
                borderRadius: "9999px",
                background: "var(--bg-input)",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  borderRadius: "9999px",
                  background: macro.color,
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Value */}
            <div
              style={{
                color: valueColor,
                fontWeight: "bold",
                fontSize: "10px",
                fontVariantNumeric: "tabular-nums",
                minWidth: "50px",
                textAlign: "right",
              }}
            >
              {formatValue()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
