import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getRangeStats } from "@/services/statsService";
import { getProfile } from "@/services/profileService";
import { us } from "@/lib/unitSpace";

function getWeekRange(firstDay: number = 0) {
  // firstDay: 0=Sunday, 1=Monday
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday
  const diff = (currentDay - firstDay + 7) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

type Range = "week" | "month";

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

export default function TrendsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("week");
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const firstDay = profile?.first_day_of_week ?? 0;
  const { start, end } = range === "week" ? getWeekRange(firstDay) : getMonthRange();

  const { data, isLoading } = useQuery({
    queryKey: ["rangeStats", start, end],
    queryFn: () => getRangeStats(start, end),
  });

  const isWeek = range === "week";

  const chartData = (data?.days ?? []).map((d) => ({
    date: formatDate(d.date),
    ...(isWeek
      ? { protein: Math.round(d.total_protein_g * 4), fat: Math.round(d.total_fat_g * 9), carbs: Math.round(d.total_carbs_g * 4) }
      : { calories: d.total_calories }),
  }));

  // Calculate averages
  const activeDays = data?.days.filter((d) => d.entry_count > 0) ?? [];
  const n = activeDays.length || 1;
  const avg = {
    cal: Math.round(activeDays.reduce((s, d) => s + d.total_calories, 0) / n),
    p: Math.round(activeDays.reduce((s, d) => s + d.total_protein_g, 0) / n),
    f: Math.round(activeDays.reduce((s, d) => s + d.total_fat_g, 0) / n),
    c: Math.round(activeDays.reduce((s, d) => s + d.total_carbs_g, 0) / n),
  };

  const ranges: { value: Range; labelKey: string }[] = [
    { value: "week", labelKey: "trends.week" },
    { value: "month", labelKey: "trends.month" },
  ];

  return (
    <div className="px-5 pt-8 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{t("trends.title")}</h1>
        <div className="flex rounded-xl overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
          {ranges.map((r) => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className="px-4 py-2 text-xs font-semibold transition-all"
              style={range === r.value
                ? { backgroundColor: "var(--bg-card-solid)", color: "var(--text-primary)", boxShadow: "var(--shadow-card)" }
                : { color: "var(--text-muted)" }}>
              {t(r.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Calorie / Macro Chart — Primary Section */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-accent)" }} />
        </div>
      ) : (
        <div className="glass-card p-4 animate-fade-up stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} style={{ color: "var(--theme-accent)" }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {isWeek ? t("trends.macroBreakdown") : t("trends.calories")}
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={35} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--bg-card-solid)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--text-primary)" }}
                labelStyle={{ color: "var(--text-primary)" }}
                itemStyle={{ color: "var(--text-secondary)" }}
              />
              {isWeek ? (
                <>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} formatter={(value: string) => <span style={{ marginInlineStart: 4 }}>{value}</span>} />
                  <Bar dataKey="protein" stackId="a" fill="#6366f1" name={t("macros.protein")} cursor={{ fill: "var(--bg-card)" } as any} />
                  <Bar dataKey="fat" stackId="a" fill="#f59e0b" name={t("macros.fat")} cursor={{ fill: "var(--bg-card)" } as any} />
                  <Bar dataKey="carbs" stackId="a" fill="#10b981" name={t("macros.carbs")} radius={[6, 6, 0, 0]} cursor={{ fill: "var(--bg-card)" } as any} />
                </>
              ) : (
                <Bar dataKey="calories" fill="var(--theme-accent)" radius={[6, 6, 0, 0]} cursor={{ fill: "var(--bg-card)" } as any} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Section — Averages & Days Logged */}
      {data && (
        <div className="mt-6 animate-fade-up stagger-2">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            {t("trends.averages")}
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: t("dashboard.kcal"), value: avg.cal, color: "var(--theme-accent)" },
              { label: t("macros.protein"), value: `${avg.p}${us()}${t("log.g")}`, color: "#6366f1" },
              { label: t("macros.fat"), value: `${avg.f}${us()}${t("log.g")}`, color: "#f59e0b" },
              { label: t("macros.carbs"), value: `${avg.c}${us()}${t("log.g")}`, color: "#10b981" },
            ].map((item) => (
              <div key={item.label} className="glass-card-sm p-3 text-center">
                <p className="text-base font-bold tabular-nums" style={{ color: item.color }}>{item.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>{item.label}</p>
              </div>
            ))}
          </div>
          <div className="glass-card-sm p-4 mt-3 flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{t("trends.daysLogged")}</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>
              {activeDays.length} / {range === "week" ? 7 : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
