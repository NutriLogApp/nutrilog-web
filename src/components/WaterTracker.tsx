import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Droplets, Plus, Minus } from "lucide-react";
import { getTodayWater, addWater } from "@/services/waterService";

const GLASS_ML = 250;

export default function WaterTracker() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["water"], queryFn: getTodayWater });
  const addMut = useMutation({
    mutationFn: (ml: number) => addWater(ml),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water"] }),
  });

  if (!data) return null;

  const pct = Math.min(data.amount_ml / (data.goal_ml || 1), 1);
  const glasses = Math.round(data.amount_ml / GLASS_ML);

  return (
    <div className="glass-card-sm p-4 animate-fade-up stagger-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(56, 189, 248, 0.12)" }}>
            <Droplets size={16} color="#38bdf8" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("water.title")}</span>
        </div>
        <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
          {data.amount_ml} / {data.goal_ml} {t("water.ml")}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: "var(--bg-input)" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct * 100}%`, background: "linear-gradient(90deg, #38bdf8, #0ea5e9)" }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{glasses} {t("water.glasses")}</span>
        <div className="flex gap-1.5">
          <button onClick={() => addMut.mutate(-GLASS_ML)} disabled={data.amount_ml <= 0}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-20 transition-all active:scale-90"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)" }}>
            <Minus size={14} />
          </button>
          <button onClick={() => addMut.mutate(GLASS_ML)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
            style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)" }}>
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
