import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Camera, Type, Loader2, RefreshCw } from "lucide-react";
import i18n from "@/i18n";
import { parseText, parseImage, reparseImage } from "@/services/foodService";
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
  const [drinkFavorites, setDrinkFavorites] = useState<Record<number, DrinkSuggestion | null>>({});
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const recentFoods = useQuery({ queryKey: ["recentFoods"], queryFn: () => getRecentFoods() });
  const existingDrinks = useQuery({ queryKey: ["drinks"], queryFn: listDrinks });

  // Populate drinkFavorites when items change
  useEffect(() => {
    if (items.length === 0 || !existingDrinks.data) {
      setDrinkFavorites({});
      return;
    }
    const existingNames = new Set(existingDrinks.data.map(d => d.name.toLowerCase()));
    const initial: Record<number, DrinkSuggestion | null> = {};
    items.forEach((item, idx) => {
      if (item.is_drink) {
        if (existingNames.has(item.food_name.toLowerCase())) {
          initial[idx] = null; // already exists
        } else {
          initial[idx] = {
            name: item.food_name,
            name_he: item.food_name_he ?? null,
            icon: "\uD83E\uDD64",
            volume_ml: item.volume_ml ?? item.grams,
            calories: item.calories,
            sugar_g: 0,
            protein_g: item.protein_g,
            fat_g: item.fat_g,
            carbs_g: item.carbs_g,
            water_pct: item.water_pct ?? 0,
          };
        }
      }
    });
    setDrinkFavorites(initial);
  }, [items, existingDrinks.data]);

  const saveMut = useMutation({
    mutationFn: (entry: EntryCreate) => createEntry(entry),
    onSuccess: async () => {
      // Create custom drinks for toggled-on favorites
      const drinksToCreate = Object.values(drinkFavorites).filter(
        (s): s is DrinkSuggestion => s !== null
      );
      if (drinksToCreate.length > 0) {
        await Promise.all(
          drinksToCreate.map(s =>
            createDrink({
              name: s.name, name_he: s.name_he, icon: s.icon,
              volume_ml: s.volume_ml, calories: s.calories,
              sugar_g: s.sugar_g, protein_g: s.protein_g,
              fat_g: s.fat_g, carbs_g: s.carbs_g,
              counts_as_water: s.water_pct > 0, water_pct: s.water_pct,
            })
          )
        );
        qc.invalidateQueries({ queryKey: ["drinks"] });
      }
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      qc.invalidateQueries({ queryKey: ["recentFoods"] });
      qc.invalidateQueries({ queryKey: ["water"] });
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
    setPreviewUrl(URL.createObjectURL(file));
    setParsing(true); setError(null);
    try { const r = await parseImage(file); setItems(r.items); setImageUrl(r.image_url); }
    catch { setError(t("log.failedImage")); }
    finally { setParsing(false); }
  }

  function handleRetakePhoto() {
    setPreviewUrl(null);
    setImageUrl(null);
    setItems([]);
    setError(null);
    setShowHint(false);
    setHintText("");
    fileRef.current?.click();
  }

  async function handleReparse() {
    if (!hintText.trim() || !imageUrl) return;
    setParsing(true); setError(null);
    try {
      const newItems = await reparseImage(imageUrl, hintText);
      setItems(newItems);
      setShowHint(false);
      setHintText("");
    } catch { setError(t("log.failedReparse")); }
    finally { setParsing(false); }
  }

  function updateItemGrams(idx: number, grams: number) {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const ratio = grams / (item.grams || 1);
      return { ...item, grams, calories: Math.round(item.calories * ratio), protein_g: +(item.protein_g * ratio).toFixed(1), fat_g: +(item.fat_g * ratio).toFixed(1), carbs_g: +(item.carbs_g * ratio).toFixed(1) };
    }));
  }

  function toggleDrinkFavorite(idx: number) {
    setDrinkFavorites(prev => {
      const next = { ...prev };
      if (next[idx]) {
        // Toggle OFF — remove the suggestion
        next[idx] = undefined as unknown as DrinkSuggestion | null;
        delete next[idx];
      } else if (next[idx] === undefined) {
        // Toggle back ON — reconstruct from current item
        const item = items[idx];
        next[idx] = {
          name: item.food_name,
          name_he: item.food_name_he ?? null,
          icon: "\uD83E\uDD64",
          volume_ml: item.volume_ml ?? item.grams,
          calories: item.calories,
          sugar_g: 0,
          protein_g: item.protein_g,
          fat_g: item.fat_g,
          carbs_g: item.carbs_g,
          water_pct: item.water_pct ?? 0,
        };
      }
      return next;
    });
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
          <button key={key} onClick={() => { setTab(key); setItems([]); setError(null); setShowHint(false); setHintText(""); setPreviewUrl(null); }}
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
          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={previewUrl} alt="" className="w-full max-h-48 object-cover rounded-xl" />
              {parsing && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <Loader2 size={28} className="animate-spin text-white" />
                </div>
              )}
              {!parsing && (
                <button onClick={handleRetakePhoto}
                  className="absolute top-2 end-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(4px)" }}>
                  <RefreshCw size={12} />
                  {t("log.retakePhoto")}
                </button>
              )}
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={parsing}
              className="w-full py-10 border-2 border-dashed rounded-xl text-sm flex flex-col items-center gap-2 transition-all active:scale-[0.98]"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              {parsing ? <Loader2 size={24} className="animate-spin" /> : <><Camera size={28} /><span>{t("log.takePhoto")}</span></>}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {items.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t("log.aiResult")}</p>

          {/* Hint correction for photo tab */}
          {tab === "photo" && imageUrl && (
            <div>
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="w-full text-center py-2 text-xs font-medium rounded-lg transition-all active:scale-[0.98]"
                  style={{ color: "var(--text-muted)", backgroundColor: "rgba(239,68,68,0.06)", border: "1px dashed rgba(239,68,68,0.25)" }}
                >
                  {t("log.notAccurate")}
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={hintText}
                    onChange={(e) => setHintText(e.target.value)}
                    placeholder={t("log.hintPlaceholder")}
                    className="w-full rounded-xl p-3 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
                    style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  />
                  <button
                    onClick={handleReparse}
                    disabled={parsing || !hintText.trim()}
                    className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
                  >
                    {parsing ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("log.reanalyze")}
                  </button>
                </div>
              )}
            </div>
          )}

          {items.map((item, i) => {
            const isHe = i18n.language === "he";
            const name = isHe && item.food_name_he ? item.food_name_he : item.food_name;
            const isDrink = !!item.is_drink;
            const favoriteState = drinkFavorites[i]; // null = already exists, DrinkSuggestion = toggled ON, undefined = toggled OFF
            const isToggledOn = isDrink && favoriteState !== null && favoriteState !== undefined;

            return (
              <div key={i} className="glass-card-sm p-3.5"
                style={isDrink ? { borderLeft: "3px solid rgba(56, 189, 248, 0.5)" } : undefined}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{name}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{item.calories} {t("dashboard.kcal")}</span>
                </div>

                {/* Amount input with full label */}
                <div className="mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--text-muted)" }}>
                    {isDrink ? t("log.milliliters") : t("log.grams")}
                  </span>
                  <div className="flex items-center rounded-lg mt-0.5 px-2.5 py-1.5" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}>
                    <input type="number" value={item.grams} onChange={(e) => updateItemGrams(i, +e.target.value || 0)}
                      className="flex-1 bg-transparent text-sm font-medium focus:outline-none" style={{ color: "var(--text-primary)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{isDrink ? "mL" : "g"}</span>
                  </div>
                </div>

                <div className="flex gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <span><span className="text-indigo-500 font-semibold">{item.protein_g}</span> {t("macros.protein")}</span>
                  <span><span className="text-amber-500 font-semibold">{item.fat_g}</span> {t("macros.fat")}</span>
                  <span><span className="text-emerald-500 font-semibold">{item.carbs_g}</span> {t("macros.carbs")}</span>
                </div>

                {/* Drink favorite toggle */}
                {isDrink && favoriteState !== null && (
                  <button onClick={() => toggleDrinkFavorite(i)}
                    className="flex items-center gap-2.5 w-full mt-2.5 px-3 py-2 rounded-xl transition-all active:scale-[0.98]"
                    style={{ backgroundColor: isToggledOn ? "rgba(56, 189, 248, 0.08)" : "var(--bg-input)" }}>
                    {/* Pill toggle */}
                    <div className="relative flex-shrink-0" style={{ width: 36, height: 20, borderRadius: 10, background: isToggledOn ? "linear-gradient(135deg, var(--theme-start), var(--theme-end))" : "var(--border)", transition: "background 0.2s" }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 2, transition: "left 0.2s, right 0.2s", ...(isToggledOn ? { right: 2 } : { left: 2 }), boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: isToggledOn ? "var(--theme-accent, #14b8a6)" : "var(--text-muted)" }}>
                      {t("log.addToFavorites")}
                    </span>
                  </button>
                )}
                {isDrink && favoriteState === null && (
                  <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
                    {t("log.alreadyInFavorites")}
                  </p>
                )}
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
