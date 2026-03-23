import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { updateEntry } from "@/services/entriesService";
import i18n from "@/i18n";
import type { EntryOut, FoodItem } from "@/types/api";

interface Props {
  entry: EntryOut;
  onClose: () => void;
}

function calcCalories(p: number, f: number, c: number): number {
  return Math.round(p * 4 + f * 9 + c * 4);
}

export default function EntryEditModal({ entry, onClose }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    setItems(entry.items.map((item) => ({
      ...item,
      calories: item.calories || calcCalories(item.protein_g, item.fat_g, item.carbs_g),
    })));
  }, [entry]);

  const saveMut = useMutation({
    mutationFn: () => updateEntry(entry.id, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      onClose();
    },
  });

  function updateItem(idx: number, field: "protein_g" | "fat_g" | "carbs_g" | "grams", value: number) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field !== "grams") {
        updated.calories = calcCalories(updated.protein_g, updated.fat_g, updated.carbs_g);
      }
      return updated;
    }));
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const isHe = i18n.language === "he";
        const name = isHe && item.food_name_he ? item.food_name_he : item.food_name;
        return (
          <div key={idx} className="glass-card-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{name}</p>
              <div className="text-end">
                <p className="text-lg font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>
                  {item.calories}
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t("dashboard.kcal")}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "grams" as const, label: t("log.g"), color: "var(--text-secondary)" },
                { key: "protein_g" as const, label: t("macros.protein"), color: "#6366f1" },
                { key: "fat_g" as const, label: t("macros.fat"), color: "#f59e0b" },
                { key: "carbs_g" as const, label: t("macros.carbs"), color: "#10b981" },
              ].map(({ key, label, color }) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold" style={{ color }}>{label}</label>
                  <input
                    type="number"
                    step={key === "grams" ? "1" : "0.1"}
                    value={item[key]}
                    onChange={(e) => updateItem(idx, key, +(e.target.value) || 0)}
                    className="w-full rounded-lg px-2 py-2 text-sm text-center mt-0.5 tabular-nums"
                    style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              ))}
            </div>

            <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
              {t("myday.caloriesAuto")}
            </p>
          </div>
        );
      })}

      <div className="flex gap-2">
        <button onClick={onClose}
          className="flex-1 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)" }}>
          {t("profile.cancel")}
        </button>
        <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
          {saveMut.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("profile.save")}
        </button>
      </div>
    </div>
  );
}
