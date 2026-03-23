import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
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
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-start)" }} />
      </div>
    );
  }

  const goal = data.goal_calories ?? 2000;

  return (
    <div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {getGreeting(t)}
        </h1>
        <p className="text-[13px] mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
          {t("dashboard.goal")}: {goal.toLocaleString()} {t("dashboard.kcal")}
        </p>
      </div>

      {/* Calorie Ring */}
      <CalorieRing consumed={data.total_calories} goal={goal} />

      {/* Macros */}
      <div className="flex gap-2.5 animate-fade-up stagger-2">
        <MacroCard label={t("macros.protein")} value={data.total_protein_g} goal={data.goal_protein_g} color="#6366f1" />
        <MacroCard label={t("macros.fat")} value={data.total_fat_g} goal={data.goal_fat_g} color="#f59e0b" />
        <MacroCard label={t("macros.carbs")} value={data.total_carbs_g} goal={data.goal_carbs_g} color="#10b981" />
      </div>

      <WaterTracker />
      <PetCat />
      <CompetitionWidget />

      {/* Today's Log */}
      <div className="flex items-center justify-between animate-fade-up stagger-5">
        <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{t("dashboard.todayLog")}</h2>
      </div>

      <div className="space-y-2.5">
        {data.entries.length === 0 && (
          <p className="text-sm text-center py-8 font-medium" style={{ color: "var(--text-muted)" }}>
            {t("dashboard.noEntries")}
          </p>
        )}
        {data.entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onDelete={(id) => deleteMut.mutate(id)} />
        ))}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => navigate("/log")}
        className="fixed bottom-28 end-5 w-14 h-14 rounded-2xl flex items-center justify-center text-white z-40 transition-all duration-200 active:scale-90"
        style={{
          background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
          boxShadow: "var(--shadow-fab)",
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <UnlockNotification />
    </div>
  );
}
