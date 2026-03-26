import { useQueries, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Flame, Target, BarChart3, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { getProfile } from "@/services/profileService";
import { getWeightHistory } from "@/services/weightService";
import type { TabName } from "./ProfileTabs";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

interface Props {
  onSwitchTab: (tab: TabName) => void;
}

export default function StatsTab({ onSwitchTab }: Props) {
  const { t } = useTranslation();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const { data: weightHistory } = useQuery({ queryKey: ["weightHistory"], queryFn: getWeightHistory });

  // Fetch last 7 days of stats for adherence calc
  const days = Array.from({ length: 7 }, (_, i) => daysAgo(i));
  const statsQueries = useQueries({
    queries: days.map((date) => ({
      queryKey: ["dailyStats", date],
      queryFn: () => getDailyStats(date),
    })),
  });

  const streak = profile?.current_streak ?? 0;
  const bestStreak = profile?.longest_streak ?? 0;

  // Calorie adherence
  const goalHit = statsQueries.reduce((count, q) => {
    if (!q.data) return count;
    const goal = q.data.goal_calories ?? 0;
    if (goal === 0) return count;
    const pct = q.data.total_calories / goal;
    return pct >= 0.9 && pct <= 1.1 ? count + 1 : count;
  }, 0);

  // Weight
  const latestWeight = weightHistory?.[weightHistory.length - 1];
  // Find the weight entry closest to 30 days ago (iterate backwards since array is date-ascending)
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoWeight = weightHistory && weightHistory.length > 1
    ? [...weightHistory].reverse().find((w) => new Date(w.date) <= monthAgo) ?? weightHistory[0]
    : null;
  const weightDelta = latestWeight && monthAgoWeight
    ? +(latestWeight.weight_kg - monthAgoWeight.weight_kg).toFixed(1)
    : null;

  return (
    <div className="space-y-3">
      {/* Streaks */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center p-3.5">
          <Flame size={18} style={{ color: "var(--theme-accent)", marginRight: 10, flexShrink: 0 }} />
          <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {t("profileTabs.currentStreak")}
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {streak} {t("profileTabs.days")}
          </span>
        </div>
        <div className="flex items-center p-3.5" style={{ borderTop: "1px solid var(--border)" }}>
          <Target size={18} style={{ color: "var(--theme-accent)", marginRight: 10, flexShrink: 0 }} />
          <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {t("profileTabs.bestStreak")}
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {bestStreak} {t("profileTabs.days")}
          </span>
        </div>
      </div>

      {/* Calorie adherence */}
      <div className="glass-card p-3.5">
        <div className="flex items-center mb-2">
          <BarChart3 size={16} style={{ color: "var(--theme-accent)", marginRight: 10, flexShrink: 0 }} />
          <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {t("profileTabs.weeklyGoalHit")}
          </span>
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {t("profileTabs.daysCount", { hit: goalHit, total: 7 })}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${(goalHit / 7) * 100}%`,
              background: "linear-gradient(90deg, var(--theme-start), var(--theme-end))",
            }}
          />
        </div>
      </div>

      {/* Weight metric */}
      <button
        onClick={() => onSwitchTab("weight")}
        className="glass-card p-3.5 w-full text-start active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center">
          <Scale size={18} style={{ color: "var(--theme-accent)", marginRight: 10, flexShrink: 0 }} />
          <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {t("profileTabs.weightLabel")}
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {latestWeight ? `${latestWeight.weight_kg} kg` : "-- kg"}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ marginLeft: 8 }}>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
        {weightDelta !== null && (
          <div className="flex items-center gap-1 mt-1" style={{ paddingLeft: 28 }}>
            {weightDelta <= 0 ? (
              <TrendingDown size={12} style={{ color: "#22c55e" }} />
            ) : (
              <TrendingUp size={12} style={{ color: "#ef4444" }} />
            )}
            <span className="text-[11px]" style={{ color: weightDelta <= 0 ? "#22c55e" : "#ef4444" }}>
              {weightDelta > 0 ? "+" : ""}{weightDelta} kg {t("profileTabs.thisMonth")}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
