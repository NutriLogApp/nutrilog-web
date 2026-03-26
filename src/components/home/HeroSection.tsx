import React from "react";
import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CalorieRing } from "./CalorieRing";
import { MacroColumn } from "./MacroColumn";

interface HeroSectionProps {
  caloriesConsumed: number;
  caloriesGoal: number;
  proteinConsumed: number;
  proteinGoal: number;
  fatConsumed: number;
  fatGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  waterMl: number;
  waterGoalMl: number;
  streak: number;
}

export function HeroSection({
  caloriesConsumed,
  caloriesGoal,
  proteinConsumed,
  proteinGoal,
  fatConsumed,
  fatGoal,
  carbsConsumed,
  carbsGoal,
  waterMl,
  waterGoalMl,
  streak,
}: HeroSectionProps) {
  const { t, i18n } = useTranslation();

  const locale = i18n.language === "he" ? "he-IL" : "en-US";
  const dateStr = new Date().toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, var(--theme-start) 14%, transparent), color-mix(in srgb, var(--theme-end) 8%, transparent))`,
        padding: "16px 16px 12px",
      }}
    >
      {/* Header row */}
      <div className="flex justify-between items-center mb-3">
        {/* Streak pill */}
        <div
          className="rounded-full px-3 py-1 flex items-center gap-1.5"
          style={{ background: "rgba(245,158,11,0.08)" }}
        >
          <Flame size={14} color="#f59e0b" />
          <span style={{ fontSize: 11, fontWeight: 600 }}>
            {t("home.streak", { count: streak })
              .split(String(streak))
              .reduce<React.ReactNode[]>((acc, part, i, arr) => {
                acc.push(<span key={`p${i}`}>{part}</span>);
                if (i < arr.length - 1) {
                  acc.push(
                    <span key={`n${i}`} style={{ color: "#f59e0b" }}>
                      {streak}
                    </span>
                  );
                }
                return acc;
              }, [])}
          </span>
        </div>

        {/* Date text */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          {dateStr}
        </span>
      </div>

      {/* Ring + Macro row */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-shrink-0">
          <CalorieRing
            caloriesConsumed={caloriesConsumed}
            caloriesGoal={caloriesGoal}
            proteinPct={proteinGoal > 0 ? proteinConsumed / proteinGoal : 0}
            fatPct={fatGoal > 0 ? fatConsumed / fatGoal : 0}
            carbsPct={carbsGoal > 0 ? carbsConsumed / carbsGoal : 0}
            waterPct={waterGoalMl > 0 ? waterMl / waterGoalMl : 0}
          />
        </div>
        <div className="flex-1 min-w-0">
          <MacroColumn
            proteinConsumed={proteinConsumed}
            proteinGoal={proteinGoal}
            fatConsumed={fatConsumed}
            fatGoal={fatGoal}
            carbsConsumed={carbsConsumed}
            carbsGoal={carbsGoal}
            waterMl={waterMl}
            waterGoalMl={waterGoalMl}
          />
        </div>
      </div>
    </div>
  );
}
