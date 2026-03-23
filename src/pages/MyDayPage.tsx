import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import i18n from "@/i18n";
import { Plus, Trash2, Droplets } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { deleteEntry } from "@/services/entriesService";
import { getTodayWater, addWater } from "@/services/waterService";
import { listDrinks, type DrinkOut } from "@/services/drinksService";
import Modal from "@/components/Modal";
import LogFoodModal from "@/components/LogFoodModal";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function MyDayPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showAddFood, setShowAddFood] = useState(false);

  const { data: stats } = useQuery({ queryKey: ["dailyStats", todayStr()], queryFn: () => getDailyStats(todayStr()) });
  const { data: water } = useQuery({ queryKey: ["water"], queryFn: getTodayWater });
  const { data: drinks } = useQuery({ queryKey: ["drinks"], queryFn: listDrinks });

  const deleteMut = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyStats"] }),
  });

  const waterMut = useMutation({
    mutationFn: (ml: number) => addWater(ml),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water"] }),
  });

  function logDrink(drink: DrinkOut) {
    if (drink.counts_as_water) {
      waterMut.mutate(drink.volume_ml);
    }
    // If drink has calories, also add as food entry
    if (drink.calories > 0) {
      const { createEntry } = require("@/services/entriesService");
      const isHe = i18n.language === "he";
      createEntry({
        description: isHe && drink.name_he ? drink.name_he : drink.name,
        source: "text",
        meal_type: "snack",
        items: [{
          food_name: drink.name,
          food_name_he: drink.name_he,
          grams: drink.volume_ml,
          calories: drink.calories,
          protein_g: drink.protein_g,
          fat_g: drink.fat_g,
          carbs_g: drink.carbs_g,
          confidence: "high" as const,
        }],
      }).then(() => qc.invalidateQueries({ queryKey: ["dailyStats"] }));
    }
  }

  const waterPct = water ? Math.min(water.amount_ml / (water.goal_ml || 1), 1) : 0;

  return (
    <div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {t("myday.title")}
        </h1>
        <button
          onClick={() => setShowAddFood(true)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all active:scale-90"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Water section */}
      <div className="glass-card p-4 animate-fade-up stagger-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(56, 189, 248, 0.12)" }}>
              <Droplets size={16} color="#38bdf8" />
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("water.title")}</span>
          </div>
          <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
            {water?.amount_ml ?? 0} / {water?.goal_ml ?? 2000} {t("water.ml")}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: "var(--bg-input)" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${waterPct * 100}%`, background: "linear-gradient(90deg, #38bdf8, #0ea5e9)" }} />
        </div>

        {/* Quick drink buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => waterMut.mutate(250)}
            className="glass-card-sm px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            style={{ color: "var(--text-secondary)" }}
          >
            💧 +250{t("water.ml")}
          </button>
          {drinks?.map((d) => (
            <button
              key={d.id}
              onClick={() => logDrink(d)}
              className="glass-card-sm px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
              style={{ color: "var(--text-secondary)" }}
            >
              {d.icon} {i18n.language === "he" && d.name_he ? d.name_he : d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Food entries */}
      <div className="animate-fade-up stagger-2">
        <h2 className="text-base font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          {t("myday.food")}
        </h2>
        <div className="space-y-2.5">
          {(!stats || stats.entries.length === 0) && (
            <p className="text-sm text-center py-8 font-medium" style={{ color: "var(--text-muted)" }}>
              {t("myday.noFood")}
            </p>
          )}
          {stats?.entries.map((entry) => {
            const time = new Date(entry.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={entry.id} className="glass-card-sm p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {entry.description}
                  </p>
                  <p className="text-[11px] mt-1 font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {time} · {entry.total_calories} {t("dashboard.kcal")} · {t("macros.protein")} {Math.round(entry.total_protein_g)}{t("log.g")}
                  </p>
                </div>
                <button
                  onClick={() => deleteMut.mutate(entry.id)}
                  className="p-2 rounded-full transition-all hover:bg-red-500/10 active:scale-90"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add food modal */}
      <Modal open={showAddFood} onClose={() => setShowAddFood(false)} title={t("log.title")}>
        <LogFoodModal onDone={() => { setShowAddFood(false); qc.invalidateQueries({ queryKey: ["dailyStats"] }); }} />
      </Modal>
    </div>
  );
}
