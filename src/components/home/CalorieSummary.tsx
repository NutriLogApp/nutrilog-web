import { useState, useEffect } from "react";
import { Bell, ChevronDown, ChevronUp, Droplet, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface CalorieSummaryProps {
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
  onBellClick: () => void;
  hasUnread: boolean;
  homeViewMode?: string;
}

const STORAGE_KEY = "mealriot_hero_expanded";

const MACROS = [
  { key: "protein", color: "#0d9488", labelKey: "macros.protein" },
  { key: "fat", color: "#f59e0b", labelKey: "macros.fat" },
  { key: "carbs", color: "#ec4899", labelKey: "macros.carbs" },
  { key: "water", color: "#38bdf8", labelKey: "" },
] as const;

export function CalorieSummary({
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
  onBellClick,
  hasUnread,
  homeViewMode,
}: CalorieSummaryProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );

  const isFull = homeViewMode === "full";

  useEffect(() => {
    if (isFull) setExpanded(true);
  }, [isFull]);

  const remaining = Math.max(caloriesGoal - caloriesConsumed, 0);
  const animatedRemaining = useAnimatedNumber(remaining);
  const calorieProgress = Math.min(
    caloriesGoal > 0 ? caloriesConsumed / caloriesGoal : 0,
    1
  );

  const macroData = [
    { consumed: proteinConsumed, goal: proteinGoal },
    { consumed: fatConsumed, goal: fatGoal },
    { consumed: carbsConsumed, goal: carbsGoal },
    { consumed: waterMl, goal: waterGoalMl },
  ];

  const waterL = (waterMl / 1000).toFixed(1);
  const waterGoalL = (waterGoalMl / 1000).toFixed(1);

  const toggleExpanded = () => {
    if (isFull) return;
    const next = !expanded;
    setExpanded(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, var(--theme-start) 14%, transparent), color-mix(in srgb, var(--theme-end) 8%, transparent))`,
        marginTop: "calc(-1 * env(safe-area-inset-top, 0px))",
        padding: "calc(16px + env(safe-area-inset-top, 0px)) 16px 12px",
      }}
    >
      {/* Header row: streak pill + bell right-aligned */}
      <div className="flex justify-end items-center mb-3">
        <div className="flex items-center gap-2">
          {/* Streak pill */}
          <div
            className="rounded-full px-3 py-1 flex items-center gap-1.5"
            style={{ background: "rgba(245,158,11,0.08)" }}
          >
            <Flame size={14} color="#f59e0b" />
            <span style={{ fontSize: 11, fontWeight: 600 }}>
              {t("home.streak", { count: streak })}
            </span>
          </div>

          {/* Bell icon */}
          <button
            data-testid="bell-button"
            onClick={onBellClick}
            className="relative p-1.5"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <Bell size={20} color="var(--text-secondary)" />
            {hasUnread && (
              <span
                data-testid="unread-badge"
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Big remaining / daily goal */}
      <div className="text-center">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2 }}>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1.1,
              color: "var(--text-primary)",
            }}
          >
            {animatedRemaining.toLocaleString()}
          </span>
          <span style={{ fontSize: 16, fontWeight: 400, color: "var(--text-muted)", margin: "0 2px" }}>/</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-secondary)" }}>
            {caloriesGoal.toLocaleString()}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2, marginTop: 3 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.02em" }}>
            {t("calorieSummary.remaining")}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 1px" }}>/</span>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.02em" }}>
            {t("calorieSummary.dailyGoal")}
          </span>
        </div>
      </div>

      {/* Thin progress bar */}
      <div
        style={{
          height: 4,
          borderRadius: 9999,
          background: "var(--bg-input)",
          marginTop: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${calorieProgress * 100}%`,
            height: "100%",
            borderRadius: 9999,
            background:
              "linear-gradient(90deg, var(--theme-start), var(--theme-end))",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Collapsed macro summary row */}
      {!isFull && (
        <div
          className="flex items-center justify-center gap-2"
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          <span>{t("macros.proteinShort")} {proteinConsumed} {t("log.g")}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{t("macros.fatShort")} {fatConsumed} {t("log.g")}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{t("macros.carbsShort")} {carbsConsumed} {t("log.g")}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span className="flex items-center gap-0.5">
            <Droplet size={12} />
            {waterL}/{waterGoalL}
          </span>
        </div>
      )}

      {/* Details toggle */}
      {!isFull && (
        <button
          onClick={toggleExpanded}
          className="flex items-center justify-center gap-1 mx-auto"
          style={{
            marginTop: 6,
            fontSize: 11,
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {t("calorieSummary.details")}
        </button>
      )}

      {/* Expanded detail bars */}
      {expanded && (
        <div className="flex flex-col gap-2" style={{ marginTop: 8 }}>
          {MACROS.map((macro, i) => {
            const { consumed, goal } = macroData[i];
            const isWater = macro.key === "water";
            const pct = goal > 0 ? Math.min(consumed / goal, 1) * 100 : 0;
            const label = isWater
              ? t("water.label")
              : t(macro.labelKey as string);
            const valueText = isWater
              ? `${(consumed / 1000).toFixed(1)}/${(goal / 1000).toFixed(1)} L`
              : `${consumed}/${goal} ${t("log.g")}`;

            return (
              <div key={macro.key}>
                <div
                  className="flex justify-between items-center"
                  style={{ fontSize: 11, marginBottom: 3 }}
                >
                  <span
                    style={{
                      color: macro.color,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {isWater && <Droplet size={12} />}
                    {label}
                  </span>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {valueText}
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    borderRadius: 9999,
                    background: "var(--bg-input)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: 9999,
                      background: macro.color,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
