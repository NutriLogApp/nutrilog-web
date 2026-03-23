import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { UtensilsCrossed, Droplets, Trash2, Pencil } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { getProfile } from "@/services/profileService";
import { deleteEntry } from "@/services/entriesService";
import { getTodayWater } from "@/services/waterService";
import { formatTime } from "@/lib/formatTime";
import Modal from "@/components/Modal";
import LogFoodModal from "@/components/LogFoodModal";
import DrinkPickerModal from "@/components/DrinkPickerModal";
import EntryEditModal from "@/components/EntryEditModal";
import type { EntryOut } from "@/types/api";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function MyDayPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const [editEntry, setEditEntry] = useState<EntryOut | null>(null);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const { data: stats } = useQuery({ queryKey: ["dailyStats", todayStr()], queryFn: () => getDailyStats(todayStr()) });
  const { data: water } = useQuery({ queryKey: ["water"], queryFn: getTodayWater });

  const deleteMut = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyStats"] }),
  });

  const use24h = profile?.use_24h ?? true;
  const waterPct = water ? Math.min(water.amount_ml / (water.goal_ml || 1), 1) : 0;

  return (
    <div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight animate-fade-up" style={{ color: "var(--text-primary)" }}>
        {t("myday.title")}
      </h1>

      {/* Two equal action buttons */}
      <div className="flex gap-3 animate-fade-up stagger-1">
        <button onClick={() => setShowAddFood(true)}
          className="flex-1 glass-card-sm p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            <UtensilsCrossed size={18} />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t("myday.addFood")}</span>
        </button>
        <button onClick={() => setShowAddDrink(true)}
          className="flex-1 glass-card-sm p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)" }}>
            <Droplets size={18} color="white" />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t("myday.addDrink")}</span>
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
            {water?.amount_ml ?? 0}/{water?.goal_ml ?? 2000}{t("water.ml")}
          </span>
        </button>
      </div>

      {/* Water progress bar */}
      <div className="animate-fade-up stagger-2">
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${waterPct * 100}%`, background: "linear-gradient(90deg, #38bdf8, #0ea5e9)" }} />
        </div>
      </div>

      {/* Daily log — food entries, newest first (backend already sorts desc) */}
      <div className="animate-fade-up stagger-3">
        <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>{t("myday.dailyLog")}</h2>
        <div className="space-y-2.5">
          {(!stats || stats.entries.length === 0) && (
            <p className="text-sm text-center py-8 font-medium" style={{ color: "var(--text-muted)" }}>{t("myday.noFood")}</p>
          )}
          {stats?.entries.map((entry) => {
            const time = formatTime(entry.logged_at, use24h);
            return (
              <div key={entry.id} className="glass-card-sm p-4 flex items-center gap-3">
                <button onClick={() => setEditEntry(entry)} className="flex-1 min-w-0 text-start">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{entry.description}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>{time}</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>·</span>
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--theme-accent)" }}>{entry.total_calories} {t("dashboard.kcal")}</span>
                  </div>
                </button>
                <button onClick={() => setEditEntry(entry)} className="p-2 rounded-full transition-all active:scale-90" style={{ color: "var(--text-muted)" }}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteMut.mutate(entry.id)} className="p-2 rounded-full transition-all hover:bg-red-500/10 active:scale-90" style={{ color: "var(--text-muted)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <Modal open={showAddFood} onClose={() => setShowAddFood(false)} title={t("log.title")}>
        <LogFoodModal onDone={() => { setShowAddFood(false); qc.invalidateQueries({ queryKey: ["dailyStats"] }); }} />
      </Modal>

      <Modal open={showAddDrink} onClose={() => setShowAddDrink(false)} title={t("myday.addDrink")}>
        <DrinkPickerModal onDone={() => { setShowAddDrink(false); }} />
      </Modal>

      {editEntry && (
        <Modal open={!!editEntry} onClose={() => setEditEntry(null)} title={t("myday.editEntry")}>
          <EntryEditModal entry={editEntry} onClose={() => setEditEntry(null)} />
        </Modal>
      )}
    </div>
  );
}
