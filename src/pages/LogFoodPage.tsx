import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Camera, Type, Loader2 } from "lucide-react";
import i18n from "@/i18n";
import { parseText, parseImage } from "@/services/foodService";
import { createEntry } from "@/services/entriesService";
import { getRecentFoods } from "@/services/recentFoodsService";
import PetReactionToast from "@/components/PetReactionToast";
import type { FoodItem, EntryCreate } from "@/types/api";

type Tab = "text" | "photo";

export default function LogFoodPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("photo");
  const [text, setText] = useState("");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [petReaction, setPetReaction] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const recentFoods = useQuery({ queryKey: ["recentFoods"], queryFn: () => getRecentFoods() });

  const saveMut = useMutation({
    mutationFn: (entry: EntryCreate) => createEntry(entry),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      qc.invalidateQueries({ queryKey: ["recentFoods"] });
      qc.invalidateQueries({ queryKey: ["petStatus"] });
      qc.invalidateQueries({ queryKey: ["water"] });
      const reaction = (data as unknown as Record<string, unknown>).pet_reaction as string | undefined;
      setPetReaction(reaction || null);
      setTimeout(() => navigate("/"), reaction ? 2000 : 0);
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
    const description = items.map((i) => (isHe && i.food_name_he ? i.food_name_he : i.food_name)).join(", ");
    saveMut.mutate({ description, source: tab === "photo" ? "image" : "text", image_url: imageUrl, meal_type: "snack", items });
  }

  function addRecentItem(item: FoodItem) { setItems((prev) => [...prev, item]); }

  const tabButtons: { key: Tab; icon: typeof Type; label: string }[] = [
    { key: "photo", icon: Camera, label: t("log.photo") },
    { key: "text", icon: Type, label: t("log.text") },
  ];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{t("log.title")}</h1>

      <div className="flex gap-1 rounded-lg p-1 mb-4" style={{ backgroundColor: "var(--bg-input)" }}>
        {tabButtons.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => { setTab(key); setItems([]); setError(null); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors"
            style={tab === key
              ? { backgroundColor: "var(--bg-card)", color: "var(--text-primary)", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }
              : { color: "var(--text-muted)" }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === "text" && (
        <div className="space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t("log.placeholder")}
            className="w-full rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--theme-start)]"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
          <button onClick={handleParseText} disabled={parsing || !text.trim()}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            {parsing ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("log.analyze")}
          </button>
        </div>
      )}

      {tab === "photo" && (
        <div className="space-y-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleImageChange} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={parsing}
            className="w-full py-8 border-2 border-dashed rounded-lg text-sm flex flex-col items-center gap-2"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            {parsing ? <Loader2 size={24} className="animate-spin" /> : <><Camera size={24} /><span>{t("log.takePhoto")}</span></>}
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {items.length > 0 && (
        <div className="mt-4">
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{t("log.aiResult")}</p>
          <div className="space-y-2">
            {items.map((item, i) => {
              const isHe = i18n.language === "he";
              const displayName = isHe && item.food_name_he ? item.food_name_he : item.food_name;
              return (
                <div key={i} className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-card)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{displayName}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.calories} {t("dashboard.kcal")}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs" style={{ color: "var(--text-muted)" }}>{t("log.g")}:</label>
                    <input type="number" value={item.grams} onChange={(e) => updateItemGrams(i, +e.target.value || 0)}
                      className="w-20 rounded px-2 py-1 text-sm"
                      style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  </div>
                  <div className="flex gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                    <span><span className="text-blue-500 font-medium">{item.protein_g}</span> {t("macros.protein")}</span>
                    <span><span className="text-amber-500 font-medium">{item.fat_g}</span> {t("macros.fat")}</span>
                    <span><span className="text-emerald-500 font-medium">{item.carbs_g}</span> {t("macros.carbs")}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={handleSave} disabled={saveMut.isPending}
            className="w-full mt-4 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            {saveMut.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("log.save")}
          </button>
        </div>
      )}

      {items.length === 0 && recentFoods.data && recentFoods.data.length > 0 && (
        <div className="mt-6">
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{t("log.recent")}</p>
          <div className="space-y-1">
            {recentFoods.data.map((rf, i) => (
              <button key={i} onClick={() => addRecentItem({ food_name: rf.food_name, food_name_he: rf.food_name_he, grams: rf.grams, calories: rf.calories, protein_g: rf.protein_g, fat_g: rf.fat_g, carbs_g: rf.carbs_g, confidence: "high" })}
                className="w-full text-start rounded-lg p-3 text-sm flex justify-between"
                style={{ backgroundColor: "var(--bg-card)" }}>
                <span style={{ color: "var(--text-primary)" }}>{i18n.language === "he" && rf.food_name_he ? rf.food_name_he : rf.food_name}</span>
                <span style={{ color: "var(--text-muted)" }}>{rf.calories} {t("dashboard.kcal")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <PetReactionToast message={petReaction} onDone={() => setPetReaction(null)} />
    </div>
  );
}
