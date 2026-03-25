import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { UtensilsCrossed, Droplets, Trash2, Pencil } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { todayLocal } from "@/lib/dateUtils";
import { getProfile } from "@/services/profileService";
import { deleteEntry } from "@/services/entriesService";
import { getTodayWater } from "@/services/waterService";
import { formatTime } from "@/lib/formatTime";
import Modal from "@/components/Modal";
import LogFoodModal from "@/components/LogFoodModal";
import DrinkPickerModal from "@/components/DrinkPickerModal";
import EntryEditModal from "@/components/EntryEditModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { EntryOut } from "@/types/api";


export default function MyDayPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const [editEntry, setEditEntry] = useState<EntryOut | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const { data: stats } = useQuery({ queryKey: ["dailyStats", todayLocal()], queryFn: () => getDailyStats(todayLocal()) });
  const { data: water } = useQuery({ queryKey: ["water"], queryFn: getTodayWater });

  const deleteMut = useMutation({
    mutationFn: (entryId: string) => deleteEntry(entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      qc.invalidateQueries({ queryKey: ["water"] });
    },
  });

  const use24h = profile?.use_24h ?? true;
  const waterAmt = water?.amount_ml ?? 0;
  const waterGoal = water?.goal_ml ?? 2000;
  const waterPct = Math.min(waterAmt / (waterGoal || 1), 1);
  const totalCal = stats?.entries.reduce((s, e) => s + e.total_calories, 0) ?? 0;

  return (
    <div className="px-5 pt-8 pb-4 max-w-lg mx-auto">
      {/* Header with daily summary */}
      <div className="flex items-end justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{t("myday.title")}</h1>
          <p className="text-[13px] font-medium mt-0.5 tabular-nums" style={{ color: "var(--text-muted)" }}>
            {stats?.entries.length ?? 0} {t("myday.entries")} · {totalCal} {t("dashboard.kcal")}
          </p>
        </div>
        {/* Water pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: "var(--bg-input)" }}>
          <Droplets size={12} color="#38bdf8" />
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--text-secondary)" }}>
            {waterAmt}/{waterGoal}
          </span>
          <div className="w-8 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
            <div className="h-full rounded-full" style={{ width: `${waterPct * 100}%`, backgroundColor: "#38bdf8" }} />
          </div>
        </div>
      </div>

      {/* Action bar — two equal buttons, horizontal */}
      <div className="flex gap-3 mb-7 animate-fade-up stagger-1">
        <button onClick={() => setShowAddFood(true)}
          className="flex-1 glass-card-sm py-3.5 flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            <UtensilsCrossed size={15} />
          </div>
          <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{t("myday.addFood")}</span>
        </button>
        <button onClick={() => setShowAddDrink(true)}
          className="flex-1 glass-card-sm py-3.5 flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)" }}>
            <Droplets size={15} color="white" />
          </div>
          <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{t("myday.addDrink")}</span>
        </button>
      </div>

      {/* Timeline entries */}
      <div className="animate-fade-up stagger-2">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
          {t("myday.dailyLog")}
        </h2>

        {(!stats || stats.entries.length === 0) && (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">🍽</p>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{t("myday.noFood")}</p>
          </div>
        )}

        <div className="space-y-2">
          {stats?.entries.map((entry, idx) => {
            const time = formatTime(entry.logged_at, use24h);
            return (
              <div key={entry.id}
                className="glass-card-sm flex items-center transition-all hover:scale-[1.005]"
                style={{ animationDelay: `${(idx + 3) * 50}ms` }}>
                {/* Time column */}
                <div className="w-14 shrink-0 py-4 flex flex-col items-center"
                  style={{ borderInlineEnd: "1px solid var(--border)" }}>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--text-muted)" }}>{time}</span>
                </div>

                {/* Content */}
                <button onClick={() => setEditEntry(entry)} className="flex-1 min-w-0 py-3.5 px-3.5 text-start">
                  <p className="font-semibold text-[13px] truncate" style={{ color: "var(--text-primary)" }}>{entry.description}</p>
                  <p className="text-[11px] font-semibold tabular-nums mt-0.5" style={{ color: "var(--theme-accent)" }}>
                    {entry.total_calories} {t("dashboard.kcal")}
                  </p>
                </button>

                {/* Actions */}
                <div className="flex items-center pe-1 shrink-0">
                  <button onClick={() => setEditEntry(entry)}
                    className="p-3 rounded-full transition-all active:scale-90"
                    style={{ color: "var(--text-muted)", minWidth: 44, minHeight: 44 }}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteId(entry.id)}
                    className="p-3 rounded-full transition-all active:scale-90 hover:bg-red-500/10"
                    style={{ color: "var(--text-muted)", minWidth: 44, minHeight: 44 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
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
        <DrinkPickerModal onDone={() => setShowAddDrink(false)} />
      </Modal>
      {editEntry && (
        <Modal open={!!editEntry} onClose={() => setEditEntry(null)} title={t("myday.editEntry")}>
          <EntryEditModal entry={editEntry} onClose={() => setEditEntry(null)} />
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteId}
        message={t("common.deleteConfirm")}
        onConfirm={() => { if (deleteId) deleteMut.mutate(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
