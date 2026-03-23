import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { deleteEntry } from "@/services/entriesService";
import CalorieRing from "@/components/CalorieRing";
import MacroCard from "@/components/MacroCard";
import EntryCard from "@/components/EntryCard";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dailyStats", todayStr()],
    queryFn: () => getDailyStats(todayStr()),
  });

  const deleteMut = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyStats"] }),
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-transparent animate-spin"
          style={{ borderTopColor: "var(--theme-start)" }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-4">
        {t("dashboard.greeting")}
      </h1>

      <div className="flex justify-center mb-4">
        <CalorieRing
          consumed={data.total_calories}
          goal={data.goal_calories ?? 2000}
        />
      </div>

      <div className="flex gap-2 mb-6">
        <MacroCard
          label={t("macros.protein")}
          value={data.total_protein_g}
          goal={data.goal_protein_g}
          color="#3b82f6"
        />
        <MacroCard
          label={t("macros.fat")}
          value={data.total_fat_g}
          goal={data.goal_fat_g}
          color="#f59e0b"
        />
        <MacroCard
          label={t("macros.carbs")}
          value={data.total_carbs_g}
          goal={data.goal_carbs_g}
          color="#10b981"
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-700">{t("dashboard.todayLog")}</h2>
        <button
          onClick={() => navigate("/log")}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: "var(--theme-start)" }}
        >
          <Plus size={16} /> {t("log.title")}
        </button>
      </div>

      <div className="space-y-2">
        {data.entries.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">
            No entries yet — tap + to log food
          </p>
        )}
        {data.entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onDelete={(id) => deleteMut.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}
