import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Trash2 } from "lucide-react";
import { useUpdateEntry } from "@/hooks/useUpdateEntry";
import { useDeleteEntry } from "@/hooks/useDeleteEntry";
import i18n from "@/i18n";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { EntryOut, FoodItem } from "@/types/api";

interface Props {
  entry: EntryOut;
  onClose: () => void;
}

export default function EntryEditModal({ entry, onClose }: Props) {
  const { t } = useTranslation();
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    setItems(entry.items.map((item) => ({ ...item })));
  }, [entry]);

  const saveMut = useUpdateEntry();
  const deleteMut = useDeleteEntry();
  const [deleteItemIdx, setDeleteItemIdx] = useState<number | null>(null);

  function removeItem(idx: number) {
    const remaining = items.filter((_, i) => i !== idx);
    if (remaining.length === 0) {
      // Last item — delete the entire entry
      deleteMut.mutate(entry.id, { onSuccess: onClose });
    } else {
      // Save with remaining items
      setItems(remaining);
      saveMut.mutate({ id: entry.id, items: remaining }, { onSuccess: () => setDeleteItemIdx(null) });
    }
  }

  function updateItemGrams(idx: number, grams: number) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const ratio = grams / (item.grams || 1);
      return {
        ...item,
        grams,
        calories: Math.round(item.calories * ratio),
        protein_g: +(item.protein_g * ratio).toFixed(1),
        fat_g: +(item.fat_g * ratio).toFixed(1),
        carbs_g: +(item.carbs_g * ratio).toFixed(1),
      };
    }));
  }

  function updateItemMacro(idx: number, field: "protein_g" | "fat_g" | "carbs_g", value: number) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      updated.calories = Math.round(updated.protein_g * 4 + updated.fat_g * 9 + updated.carbs_g * 4);
      return updated;
    }));
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const isHe = i18n.language === "he";
        const name = isHe && item.food_name_he ? item.food_name_he : item.food_name;
        const isDrink = !!item.is_drink || entry.source === "drink";
        return (
          <div key={idx} className="glass-card-sm p-4 space-y-3"
            style={isDrink ? { borderLeft: "3px solid rgba(56, 189, 248, 0.5)" } : undefined}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm flex-1 min-w-0 truncate" style={{ color: "var(--text-primary)" }}>{name}</p>
              <div className="flex items-center gap-2">
                <div className="text-end">
                  <p className="text-lg font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>
                    {item.calories}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t("dashboard.kcal")}</p>
                </div>
                <button
                  onClick={() => setDeleteItemIdx(idx)}
                  className="p-1.5 rounded-full transition-all hover:bg-red-500/10 active:scale-90"
                  style={{ color: "var(--text-muted)" }}
                  aria-label={t("common.delete")}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                {isDrink ? t("log.milliliters") : t("log.grams")}
              </label>
              <div className="flex items-center rounded-lg mt-0.5 px-2.5 py-2" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}>
                <input
                  type="number"
                  step="1"
                  value={item.grams}
                  onChange={(e) => updateItemGrams(idx, +(e.target.value) || 0)}
                  className="flex-1 bg-transparent text-sm font-medium tabular-nums focus:outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{isDrink ? "mL" : "g"}</span>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "protein_g" as const, label: t("macros.protein"), color: "#6366f1" },
                { key: "fat_g" as const, label: t("macros.fat"), color: "#f59e0b" },
                { key: "carbs_g" as const, label: t("macros.carbs"), color: "#10b981" },
              ]).map(({ key, label, color }) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold" style={{ color }}>{label}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={item[key]}
                    onChange={(e) => updateItemMacro(idx, key, +(e.target.value) || 0)}
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
        <button onClick={() => saveMut.mutate({ id: entry.id, items }, { onSuccess: onClose })} disabled={saveMut.isPending}
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
          {saveMut.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("profile.save")}
        </button>
      </div>

      <ConfirmDialog
        open={deleteItemIdx !== null}
        message={t("common.deleteConfirm")}
        onConfirm={() => {
          if (deleteItemIdx !== null) removeItem(deleteItemIdx);
          setDeleteItemIdx(null);
        }}
        onCancel={() => setDeleteItemIdx(null)}
      />
    </div>
  );
}
