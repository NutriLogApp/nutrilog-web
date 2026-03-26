import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Droplets, Coffee, Beer, Wine, CupSoda, Milk, Settings } from "lucide-react";
import { listDrinks, logDrink, type DrinkOut } from "@/services/drinksService";
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

  const logMut = useMutation({
    mutationFn: (drinkId: string) => logDrink(drinkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["water"] });
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      onDone();
    },
  });

  return (
    <div className="space-y-2">
      {drinks?.map((d: DrinkOut) => {
        const IconComp = DRINK_ICONS[d.icon] || CupSoda;
        return (
          <button key={d.id} onClick={() => logMut.mutate(d.id)}
            disabled={logMut.isPending}
            className="w-full glass-card-sm p-4 flex items-center gap-3.5 transition-all active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: d.is_default ? "rgba(56, 189, 248, 0.12)" : "var(--bg-input)" }}>
              <IconComp size={18} style={{ color: d.is_default ? "#38bdf8" : "var(--theme-accent)" }} />
            </div>
            <div className="flex-1 text-start">
              <p className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>
                {i18n.language === "he" && d.name_he ? d.name_he : d.name}
              </p>
              <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                {d.volume_ml}{t("water.ml")}
                {d.calories > 0 && ` · ${d.calories}${t("dashboard.kcal")}`}
                {d.water_pct > 0 && d.water_pct < 100 && ` · ${d.water_pct}% ${t("profile.waterContent")}`}
              </p>
            </div>
          </button>
        );
      })}

      {(!drinks || drinks.length === 0) && (
        <p className="text-center text-xs py-3" style={{ color: "var(--text-muted)" }}>{t("myday.noDrinksYet")}</p>
      )}

      <button onClick={() => { onDone(); navigate("/settings?modal=drinks"); }}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium transition-all"
        style={{ color: "var(--text-muted)" }}>
        <Settings size={14} />
        {t("myday.manageDrinks")}
      </button>
    </div>
  );
}
