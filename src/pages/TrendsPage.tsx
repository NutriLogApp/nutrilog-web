import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { getRangeStats } from "@/services/statsService";
import WeightChart from "@/components/WeightChart";

function dateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

type Range = 7 | 30 | 365;

export default function TrendsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>(7);
  const { start, end } = dateRange(range);

  const { data, isLoading } = useQuery({
    queryKey: ["rangeStats", start, end],
    queryFn: () => getRangeStats(start, end),
  });

  const chartData = (data?.days ?? []).map((d) => ({
    date: d.date.slice(5),
    calories: d.total_calories,
  }));

  const ranges: { value: Range; labelKey: string }[] = [
    { value: 7, labelKey: "trends.week" },
    { value: 30, labelKey: "trends.month" },
    { value: 365, labelKey: "trends.year" },
  ];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-4">{t("trends.title")}</h1>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-4">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${
              range === r.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {t(r.labelKey)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-transparent animate-spin"
               style={{ borderTopColor: "var(--theme-start)" }} />
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-700 mb-3">{t("trends.calories")}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <Bar dataKey="calories" fill="var(--theme-start)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && (
        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-700 mb-2">{t("trends.avgPerDay")}</h2>
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
                  <p className="font-bold text-slate-900">{avg.cal}</p>
                  <p className="text-xs text-slate-400">{t("trends.kcal")}</p>
                </div>
                <div>
                  <p className="font-bold text-blue-500">{avg.p}{t("log.g")}</p>
                  <p className="text-xs text-slate-400">{t("macros.protein")}</p>
                </div>
                <div>
                  <p className="font-bold text-amber-500">{avg.f}{t("log.g")}</p>
                  <p className="text-xs text-slate-400">{t("macros.fat")}</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-500">{avg.c}{t("log.g")}</p>
                  <p className="text-xs text-slate-400">{t("macros.carbs")}</p>
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
