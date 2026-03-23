import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Camera, Type, ScanBarcode, Loader2 } from "lucide-react";
import { parseText, parseImage, lookupBarcode } from "@/services/foodService";
import { createEntry } from "@/services/entriesService";
import { getRecentFoods } from "@/services/recentFoodsService";
import type { FoodItem, EntryCreate } from "@/types/api";

type Tab = "text" | "photo" | "barcode";

export default function LogFoodPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState<FoodItem[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const recentFoods = useQuery({
    queryKey: ["recentFoods"],
    queryFn: () => getRecentFoods(),
  });

  const saveMut = useMutation({
    mutationFn: (entry: EntryCreate) => createEntry(entry),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      qc.invalidateQueries({ queryKey: ["recentFoods"] });
      navigate("/");
    },
  });

  async function handleParseText() {
    if (!text.trim()) return;
    setParsing(true);
    setError(null);
    try {
      const result = await parseText(text);
      setItems(result);
    } catch {
      setError("Failed to parse text");
    } finally {
      setParsing(false);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setError(null);
    try {
      const result = await parseImage(file);
      setItems(result.items);
      setImageUrl(result.image_url);
    } catch {
      setError("Failed to parse image");
    } finally {
      setParsing(false);
    }
  }

  async function handleBarcodeLookup() {
    if (!barcode.trim()) return;
    setParsing(true);
    setError(null);
    try {
      const result = await lookupBarcode(barcode);
      setItems(result);
    } catch {
      setError("Barcode not found");
    } finally {
      setParsing(false);
    }
  }

  function updateItemGrams(idx: number, grams: number) {
    setItems((prev) =>
      prev.map((item, i) => {
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
      }),
    );
  }

  function handleSave() {
    if (items.length === 0) return;
    const description = items.map((i) => i.food_name).join(", ");
    saveMut.mutate({
      description,
      source: tab === "photo" ? "image" : tab === "barcode" ? "barcode" : "text",
      image_url: imageUrl,
      meal_type: "snack",
      items,
    });
  }

  function addRecentItem(item: FoodItem) {
    setItems((prev) => [...prev, item]);
  }

  const tabButtons: { key: Tab; icon: typeof Type; label: string }[] = [
    { key: "text", icon: Type, label: t("log.text") },
    { key: "photo", icon: Camera, label: t("log.photo") },
    { key: "barcode", icon: ScanBarcode, label: t("log.barcode") },
  ];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-4">{t("log.title")}</h1>

      {/* Tab selector */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-4">
        {tabButtons.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setItems([]);
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Input area */}
      {tab === "text" && (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. 2 eggs, toast with butter, coffee"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--theme-start)]"
          />
          <button
            onClick={handleParseText}
            disabled={parsing || !text.trim()}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
          >
            {parsing ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Analyze"}
          </button>
        </div>
      )}

      {tab === "photo" && (
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={parsing}
            className="w-full py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm flex flex-col items-center gap-2"
          >
            {parsing ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Camera size={24} />
                <span>Tap to take a photo</span>
              </>
            )}
          </button>
        </div>
      )}

      {tab === "barcode" && (
        <div className="space-y-2">
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode number"
            className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-start)]"
          />
          <button
            onClick={handleBarcodeLookup}
            disabled={parsing || !barcode.trim()}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
          >
            {parsing ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Look up"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {/* AI Results */}
      {items.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2">{t("log.aiResult")}</p>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-slate-900">
                    {item.food_name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.calories} kcal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">g:</label>
                  <input
                    type="number"
                    value={item.grams}
                    onChange={(e) => updateItemGrams(i, +e.target.value || 0)}
                    className="w-20 border border-slate-200 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-slate-400 ml-auto">
                    P:{item.protein_g} F:{item.fat_g} C:{item.carbs_g}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saveMut.isPending}
            className="w-full mt-4 py-3 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
          >
            {saveMut.isPending ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : (
              t("log.save")
            )}
          </button>
        </div>
      )}

      {/* Recent foods */}
      {items.length === 0 && recentFoods.data && recentFoods.data.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-slate-400 mb-2">{t("log.recent")}</p>
          <div className="space-y-1">
            {recentFoods.data.map((rf, i) => (
              <button
                key={i}
                onClick={() =>
                  addRecentItem({
                    food_name: rf.food_name,
                    food_name_he: rf.food_name_he,
                    grams: rf.grams,
                    calories: rf.calories,
                    protein_g: rf.protein_g,
                    fat_g: rf.fat_g,
                    carbs_g: rf.carbs_g,
                    confidence: "high",
                  })
                }
                className="w-full text-left bg-white rounded-lg p-3 shadow-sm text-sm flex justify-between"
              >
                <span className="text-slate-900">{rf.food_name}</span>
                <span className="text-slate-400">{rf.calories} kcal</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
