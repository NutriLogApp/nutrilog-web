import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Camera, Type, Loader2 } from "lucide-react";
import i18n from "@/i18n";
import { parseText, parseImage } from "@/services/foodService";
import { createEntry } from "@/services/entriesService";
import { getRecentFoods } from "@/services/recentFoodsService";
import { listDrinks, createDrink } from "@/services/drinksService";
import type { FoodItem, EntryCreate, DrinkSuggestion } from "@/types/api";

type Tab = "photo" | "text";

interface Props {
  onDone: () => void;
}

export default function LogFoodModal({ onDone }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("photo");
  const [text, setText] = useState("");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drinkSuggestions, setDrinkSuggestions] = useState<DrinkSuggestion[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const recentFoods = useQuery({ queryKey: ["recentFoods"], queryFn: () => getRecentFoods() });

  const saveMut = useMutation({
    mutationFn: (entry: EntryCreate) => createEntry(entry),
    onSuccess: async (result) => {
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      qc.invalidateQueries({ queryKey: ["recentFoods"] });
      qc.invalidateQueries({ queryKey: ["water"] });
      if (result.drink_suggestions && result.drink_suggestions.length > 0) {
        try {
          const existing = await listDrinks();
          const existingNames = new Set(existing.map(d => d.name.toLowerCase()));
          const newSuggestions = result.drink_suggestions.filter(
            s => !existingNames.has(s.name.toLowerCase())
          );
          if (newSuggestions.length > 0) {
            setDrinkSuggestions(newSuggestions);
            return;
          }
        } catch { /* if listDrinks fails, skip suggestions */ }
      }
      onDone();
    },
  });

  async function handleParseText() {
    if (!text.trim()) return;
    setParsing(true); setError(null);
    try { setItems(await parseText(text)); }
    catch { setError(t("log.failedText")); }
    finally { setParsing(false); }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true); setError(null);
    try { const r = await parseImage(file); setItems(r.items); setImageUrl(r.image_url); }
    catch { setError(t("log.failedImage")); }
    finally { setParsing(false); }
  }

  function updateItemGrams(idx: number, grams: number) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const ratio = grams / (item.grams || 1);
      return { ...item, grams, calories: Math.round(item.calories * ratio), protein_g: +(item.protein_g * ratio).toFixed(1), fat_g: +(item.fat_g * ratio).toFixed(1), carbs_g: +(item.carbs_g * ratio).toFixed(1) };
    }));
  }

  function handleSave() {
    if (items.length === 0) return;
    const isHe = i18n.language === "he";
    const desc = items.map((i) => (isHe && i.food_name_he ? i.food_name_he : i.food_name)).join(", ");
    saveMut.mutate({ description: desc, source: tab === "photo" ? "image" : "text", image_url: imageUrl, meal_type: "snack", items });
  }

  const tabButtons: { key: Tab; icon: typeof Type; label: string }[] = [
    { key: "photo", icon: Camera, label: t("log.photo") },
    { key: "text", icon: Type, label: t("log.text") },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: "var(--bg-input)" }}>
        {tabButtons.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => { setTab(key); setItems([]); setError(null); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all"
            style={tab === key ? { backgroundColor: "var(--bg-card-solid)", color: "var(--text-primary)", boxShadow: "var(--shadow-card)" } : { color: "var(--text-muted)" }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === "text" && (
        <div className="space-y-3">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("log.placeholder")}
            className="w-full rounded-xl p-3.5 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
          <button onClick={handleParseText} disabled={parsing || !text.trim()}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            {parsing ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("log.analyze")}
          </button>
        </div>
      )}

      {tab === "photo" && (
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleImageChange} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={parsing}
            className="w-full py-10 border-2 border-dashed rounded-xl text-sm flex flex-col items-center gap-2 transition-all active:scale-[0.98]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            {parsing ? <Loader2 size={24} className="animate-spin" /> : <><Camera size={28} /><span>{t("log.takePhoto")}</span></>}
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {items.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("log.aiResult")}</p>
          {items.map((item, i) => {
            const isHe = i18n.language === "he";
            const name = isHe && item.food_name_he ? item.food_name_he : item.food_name;
            return (
              <div key={i} className="glass-card-sm p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{name}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{item.calories} {t("dashboard.kcal")}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs" style={{ color: "var(--text-muted)" }}>{item.is_drink ? t("water.ml") : t("log.g")}:</label>
                  <input type="number" value={item.grams} onChange={(e) => updateItemGrams(i, +e.target.value || 0)}
                    className="w-20 rounded-lg px-2 py-1 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
                <div className="flex gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <span><span className="text-indigo-500 font-semibold">{item.protein_g}</span> {t("macros.protein")}</span>
                  <span><span className="text-amber-500 font-semibold">{item.fat_g}</span> {t("macros.fat")}</span>
                  <span><span className="text-emerald-500 font-semibold">{item.carbs_g}</span> {t("macros.carbs")}</span>
                </div>
              </div>
            );
          })}
          <button onClick={handleSave} disabled={saveMut.isPending}
            className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            {saveMut.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("log.save")}
          </button>
        </div>
      )}

      {drinkSuggestions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("log.drinkDetected")}</p>
          {drinkSuggestions.map((s, i) => (
            <div key={i} className="glass-card-sm p-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {i18n.language === "he" && s.name_he ? s.name_he : s.name}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {s.volume_ml}{t("water.ml")} · {s.calories}{t("dashboard.kcal")}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setDrinkSuggestions(prev => prev.filter((_, idx) => idx !== i));
                  if (drinkSuggestions.length <= 1) onDone();
                }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: "var(--bg-input)", color: "var(--text-muted)" }}>
                  {t("profile.cancel")}
                </button>
                <button onClick={async () => {
                  await createDrink({
                    name: s.name, name_he: s.name_he, icon: s.icon,
                    volume_ml: s.volume_ml, calories: s.calories,
                    sugar_g: s.sugar_g, protein_g: s.protein_g,
                    fat_g: s.fat_g, carbs_g: s.carbs_g,
                    counts_as_water: s.water_pct > 0, water_pct: s.water_pct,
                  });
                  qc.invalidateQueries({ queryKey: ["drinks"] });
                  setDrinkSuggestions(prev => prev.filter((_, idx) => idx !== i));
                  if (drinkSuggestions.length <= 1) onDone();
                }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
                  {t("profile.save")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent foods */}
      {items.length === 0 && recentFoods.data && recentFoods.data.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{t("log.recent")}</p>
          <div className="space-y-1.5">
            {recentFoods.data.map((rf, i) => (
              <button key={i} onClick={() => setItems((prev) => [...prev, { food_name: rf.food_name, food_name_he: rf.food_name_he, grams: rf.grams, calories: rf.calories, protein_g: rf.protein_g, fat_g: rf.fat_g, carbs_g: rf.carbs_g, confidence: "high" }])}
                className="w-full text-start glass-card-sm p-3 text-sm flex justify-between transition-all active:scale-[0.98]">
                <span style={{ color: "var(--text-primary)" }}>{i18n.language === "he" && rf.food_name_he ? rf.food_name_he : rf.food_name}</span>
                <span style={{ color: "var(--text-muted)" }}>{rf.calories} {t("dashboard.kcal")}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
