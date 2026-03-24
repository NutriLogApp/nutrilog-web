import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Droplets, GlassWater, Coffee, Beer, Wine, CupSoda, Milk, Settings } from "lucide-react";
import { listDrinks, type DrinkOut } from "@/services/drinksService";
import { addWater } from "@/services/waterService";
import { createEntry } from "@/services/entriesService";
import i18n from "@/i18n";

const DRINK_ICONS: Record<string, React.ElementType> = {
  "☕": Coffee, "🍵": Coffee, "🥤": CupSoda, "🍺": Beer,
  "🍷": Wine, "🧃": CupSoda, "🥛": Milk, "💧": Droplets, "🧋": Coffee, "🍶": Wine,
};

interface Props {
  onDone: () => void;
}

export default function DrinkPickerModal({ onDone }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: drinks } = useQuery({ queryKey: ["drinks"], queryFn: listDrinks });

  const waterMut = useMutation({
    mutationFn: (ml: number) => addWater(ml),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["water"] }); onDone(); },
  });

  async function pickDrink(d: DrinkOut) {
    const waterAmount = Math.round(d.volume_ml * d.water_pct / 100);
    try {
      if (waterAmount > 0) await addWater(waterAmount);
      const isHe = i18n.language === "he";
      try {
        await createEntry({
          description: isHe && d.name_he ? d.name_he : d.name,
          source: "text", meal_type: "snack",
          items: [{
            food_name: d.name, food_name_he: d.name_he,
            grams: d.volume_ml, calories: d.calories,
            protein_g: d.protein_g, fat_g: d.fat_g,
            carbs_g: d.carbs_g, confidence: "high" as const,
            ...(waterAmount > 0 && { water_ml_added: waterAmount }),
          }],
        });
      } catch (entryErr) {
        // createEntry failed — compensate by subtracting the water already added
        if (waterAmount > 0) {
          try { await addWater(-waterAmount); } catch { /* best-effort rollback */ }
        }
        throw entryErr;
      }
      qc.invalidateQueries({ queryKey: ["water"] });
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      onDone();
    } catch (err) {
      console.error("[pickDrink] failed:", err);
    }
  }

  return (
    <div className="space-y-2">
      {/* Water — always first */}
      <button onClick={() => waterMut.mutate(250)}
        className="w-full glass-card-sm p-4 flex items-center gap-3.5 transition-all active:scale-[0.98]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(56, 189, 248, 0.12)" }}>
          <GlassWater size={18} color="#38bdf8" />
        </div>
        <div className="flex-1 text-start">
          <p className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>{t("myday.glassOfWater")}</p>
          <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>250{t("water.ml")}</p>
        </div>
      </button>

      {/* Custom drinks */}
      {drinks?.map((d) => {
        const IconComp = DRINK_ICONS[d.icon] || CupSoda;
        return (
          <button key={d.id} onClick={() => pickDrink(d)}
            className="w-full glass-card-sm p-4 flex items-center gap-3.5 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-input)" }}>
              <IconComp size={18} style={{ color: "var(--theme-accent)" }} />
            </div>
            <div className="flex-1 text-start">
              <p className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>
                {i18n.language === "he" && d.name_he ? d.name_he : d.name}
              </p>
              <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                {d.volume_ml}{t("water.ml")} · {d.calories}{t("dashboard.kcal")}
                {d.water_pct > 0 && d.water_pct < 100 && ` · ${d.water_pct}% ${t("profile.waterContent")}`}
              </p>
            </div>
          </button>
        );
      })}

      {(!drinks || drinks.length === 0) && (
        <p className="text-center text-xs py-3" style={{ color: "var(--text-muted)" }}>{t("myday.noDrinksYet")}</p>
      )}

      <button onClick={() => { onDone(); navigate("/profile"); }}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium transition-all"
        style={{ color: "var(--text-muted)" }}>
        <Settings size={14} />
        {t("myday.manageDrinks")}
      </button>
    </div>
  );
}
