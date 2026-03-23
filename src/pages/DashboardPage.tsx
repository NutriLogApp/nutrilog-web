import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Camera } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { deleteEntry } from "@/services/entriesService";
import CalorieRing from "@/components/CalorieRing";
import MacroCard from "@/components/MacroCard";
import EntryCard from "@/components/EntryCard";
import PetCat from "@/components/PetCat";
import WaterTracker from "@/components/WaterTracker";
import UnlockNotification from "@/components/UnlockNotification";
import CompetitionWidget from "@/components/CompetitionWidget";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getGreeting(t: (k: string) => string) {
  const h = new Date().getHours();
  if (h < 12) return t("dashboard.goodMorning");
  if (h < 18) return t("dashboard.goodAfternoon");
  return t("dashboard.goodEvening");
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
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-transparent animate-spin"
             style={{ borderTopColor: "var(--theme-start)" }} />
      </div>
    );
  }

  const goal = data.goal_calories ?? 2000;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">{getGreeting(t)}</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {t("dashboard.goal")}: {goal.toLocaleString()} {t("dashboard.kcal")}
        </p>
      </div>

      {/* Calorie card */}
      <CalorieRing consumed={data.total_calories} goal={goal} />

      {/* Macros */}
      <div className="flex gap-2">
        <MacroCard label={t("macros.protein")} value={data.total_protein_g} goal={data.goal_protein_g} color="#3b82f6" />
        <MacroCard label={t("macros.fat")} value={data.total_fat_g} goal={data.goal_fat_g} color="#f59e0b" />
        <MacroCard label={t("macros.carbs")} value={data.total_carbs_g} goal={data.goal_carbs_g} color="#10b981" />
      </div>

      {/* Water tracker */}
      <WaterTracker />

      {/* Pet with streak badge */}
      <PetCat />

      {/* Competition */}
      <CompetitionWidget />

      {/* Today's log */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-700">{t("dashboard.todayLog")}</h2>
      </div>

      <div className="space-y-2">
        {data.entries.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">{t("dashboard.noEntries")}</p>
        )}
        {data.entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onDelete={(id) => deleteMut.mutate(id)} />
        ))}
      </div>

      {/* Floating camera FAB */}
      <button
        onClick={() => navigate("/log")}
        className="fixed bottom-24 end-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-40"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
      >
        <Camera size={22} />
      </button>

      <UnlockNotification />
    </div>
  );
}
