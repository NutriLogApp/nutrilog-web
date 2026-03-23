import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trash2, Plus } from "lucide-react";
import { listDrinks, createDrink, deleteDrink, type DrinkOut, type DrinkCreate } from "@/services/drinksService";
import i18n from "@/i18n";

interface Props {
  onClose: () => void;
}

const ICONS = ["☕", "🍵", "🥤", "🍺", "🍷", "🧃", "🥛", "💧"];

export default function DrinkManager({ onClose: _onClose }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: drinks } = useQuery({ queryKey: ["drinks"], queryFn: listDrinks });

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<DrinkCreate>({
    name: "", name_he: "", icon: "☕", volume_ml: 250,
    calories: 0, sugar_g: 0, protein_g: 0, fat_g: 0, carbs_g: 0, counts_as_water: true,
  });

  const addMut = useMutation({
    mutationFn: () => createDrink(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drinks"] });
      setAdding(false);
      setForm({ name: "", name_he: "", icon: "☕", volume_ml: 250, calories: 0, sugar_g: 0, protein_g: 0, fat_g: 0, carbs_g: 0, counts_as_water: true });
    },
  });

  const delMut = useMutation({
    mutationFn: deleteDrink,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drinks"] }),
  });

  return (
    <div className="space-y-4">
      {/* Existing drinks */}
      {drinks?.map((d: DrinkOut) => (
        <div key={d.id} className="glass-card-sm p-3.5 flex items-center gap-3">
          <span className="text-xl">{d.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {i18n.language === "he" && d.name_he ? d.name_he : d.name}
            </p>
            <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
              {d.volume_ml}{t("water.ml")} · {d.calories} {t("dashboard.kcal")}
              {d.counts_as_water && " · 💧"}
            </p>
          </div>
          <button onClick={() => delMut.mutate(d.id)} className="p-2 rounded-full transition-all hover:bg-red-500/10 active:scale-90" style={{ color: "var(--text-muted)" }}>
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      {drinks?.length === 0 && !adding && (
        <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
          {t("profile.noDrinks")}
        </p>
      )}

      {/* Add form */}
      {adding ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            {ICONS.map((ic) => (
              <button key={ic} onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                className="w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: form.icon === ic ? "var(--bg-input)" : "transparent", border: form.icon === ic ? "2px solid var(--theme-accent)" : "2px solid transparent" }}>
                {ic}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Name (EN)</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm mt-0.5" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>שם (HE)</label>
              <input value={form.name_he ?? ""} onChange={(e) => setForm((f) => ({ ...f, name_he: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm mt-0.5" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{t("water.ml")}</label>
              <input type="number" value={form.volume_ml} onChange={(e) => setForm((f) => ({ ...f, volume_ml: +e.target.value || 0 }))}
                className="w-full rounded-lg px-3 py-2 text-sm mt-0.5" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{t("dashboard.kcal")}</label>
              <input type="number" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: +e.target.value || 0 }))}
                className="w-full rounded-lg px-3 py-2 text-sm mt-0.5" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{t("profile.sugar")}</label>
              <input type="number" step="0.1" value={form.sugar_g} onChange={(e) => setForm((f) => ({ ...f, sugar_g: +e.target.value || 0 }))}
                className="w-full rounded-lg px-3 py-2 text-sm mt-0.5" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <input type="checkbox" checked={form.counts_as_water} onChange={(e) => setForm((f) => ({ ...f, counts_as_water: e.target.checked }))} className="rounded" />
            {t("profile.countsAsWater")}
          </label>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)" }}>
              {t("profile.cancel")}
            </button>
            <button onClick={() => addMut.mutate()} disabled={!form.name.trim() || addMut.isPending}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
              {t("profile.save")}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full glass-card-sm p-3.5 flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-[0.98]"
          style={{ color: "var(--theme-accent)" }}>
          <Plus size={16} /> {t("profile.addDrink")}
        </button>
      )}
    </div>
  );
}
