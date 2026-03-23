import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getRangeStats } from "@/services/statsService";
import WeightChart from "@/components/WeightChart";

function getWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
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
  const isHe = i18n.language === "he";
  return isHe ? `${d}/${m}` : `${d}/${m}`;
}

export default function TrendsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("week");

  const { start, end } = range === "week" ? getWeekRange() : getMonthRange();

  const { data, isLoading } = useQuery({
    queryKey: ["rangeStats", start, end],
    queryFn: () => getRangeStats(start, end),
  });

  const isWeek = range === "week";

  const chartData = (data?.days ?? []).map((d) => ({
    date: formatDate(d.date),
    ...(isWeek
      ? {
          protein: Math.round(d.total_protein_g * 4),
          fat: Math.round(d.total_fat_g * 9),
          carbs: Math.round(d.total_carbs_g * 4),
        }
      : { calories: d.total_calories }),
  }));

  const ranges: { value: Range; labelKey: string }[] = [
    { value: "week", labelKey: "trends.week" },
    { value: "month", labelKey: "trends.month" },
  ];

  return (
    <div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-bold tracking-tight animate-fade-up" style={{ color: "var(--text-primary)" }}>{t("trends.title")}</h1>

      <div className="flex gap-1 rounded-lg p-1 animate-fade-up" style={{ backgroundColor: "var(--bg-input)" }}>
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              range === r.value ? "shadow-sm" : ""
            }`}
            style={range === r.value ? { backgroundColor: "var(--bg-card)", color: "var(--text-primary)" } : { color: "var(--text-muted)" }}
          >
            {t(r.labelKey)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-accent)" }} />
        </div>
      ) : (
        <div className="glass-card p-4 animate-fade-up">
          <h2 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>{t("trends.calories")}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              {isWeek ? (
                <>
                  <Legend />
                  <Bar dataKey="protein" stackId="a" fill="#3b82f6" name={t("macros.protein")} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="fat" stackId="a" fill="#f59e0b" name={t("macros.fat")} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="carbs" stackId="a" fill="#10b981" name={t("macros.carbs")} radius={[4, 4, 0, 0]} />
                </>
              ) : (
                <Bar dataKey="calories" fill="var(--theme-accent)" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && (
        <div className="glass-card p-4 animate-fade-up">
          <h2 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("trends.avgPerDay")}</h2>
          {(() => {
            const days = data.days.filter((d) => d.entry_count > 0);
            const n = days.length || 1;
            const avg = {
              cal: Math.round(days.reduce((s, d) => s + d.total_calories, 0) / n),
              p: Math.round(days.reduce((s, d) => s + d.total_protein_g, 0) / n),
              f: Math.round(days.reduce((s, d) => s + d.total_fat_g, 0) / n),
              c: Math.round(days.reduce((s, d) => s + d.total_carbs_g, 0) / n),
            };
            return (
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>{avg.cal}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("trends.kcal")}</p>
                </div>
                <div>
                  <p className="font-bold text-blue-500">{avg.p}{t("log.g")}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("macros.protein")}</p>
                </div>
                <div>
                  <p className="font-bold text-amber-500">{avg.f}{t("log.g")}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("macros.fat")}</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-500">{avg.c}{t("log.g")}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("macros.carbs")}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <WeightChart />
    </div>
  );
}
