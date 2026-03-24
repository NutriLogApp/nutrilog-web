import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trash2, Loader2, Coffee, Beer, Wine, CupSoda, Milk, Droplets, GlassWater } from "lucide-react";
import { listDrinks, parseDrink, createDrink, deleteDrink, type DrinkOut, type DrinkParseResult } from "@/services/drinksService";
import i18n from "@/i18n";

export default function DrinkManager() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: drinks } = useQuery({ queryKey: ["drinks"], queryFn: listDrinks });

  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<DrinkParseResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseMut = useMutation({
    mutationFn: () => parseDrink(text),
    onMutate: () => { setParsing(true); setError(null); },
    onSuccess: (data) => { setParsed(data); setParsing(false); },
    onError: () => { setError(t("profile.parseFailed")); setParsing(false); },
  });

  const saveMut = useMutation({
    mutationFn: () => {
      if (!parsed) throw new Error("No parsed data");
      return createDrink({
        name: parsed.name,
        name_he: parsed.name_he,
        icon: parsed.icon,
        volume_ml: parsed.volume_ml,
        calories: parsed.calories,
        sugar_g: parsed.sugar_g,
        protein_g: parsed.protein_g,
        fat_g: parsed.fat_g,
        carbs_g: parsed.carbs_g,
        counts_as_water: parsed.water_pct > 0,
        water_pct: parsed.water_pct,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drinks"] });
      setParsed(null);
      setText("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteDrink,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drinks"] }),
  });

  return (
    <div className="space-y-4">
      {/* Existing drinks */}
      {drinks?.map((d: DrinkOut) => {
        const ICON_MAP: Record<string, React.ElementType> = { "☕": Coffee, "🍵": Coffee, "🥤": CupSoda, "🍺": Beer, "🍷": Wine, "🧃": CupSoda, "🥛": Milk, "💧": Droplets, "🧋": Coffee, "🍶": Wine };
        const IconComp = ICON_MAP[d.icon] || GlassWater;
        return (
        <div key={d.id} className="glass-card-sm p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-input)" }}>
            <IconComp size={16} style={{ color: "var(--theme-accent)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {i18n.language === "he" && d.name_he ? d.name_he : d.name}
            </p>
            <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
              {d.volume_ml}{t("water.ml")} · {d.calories}{t("dashboard.kcal")}
              {d.water_pct > 0 && ` · 💧${d.water_pct}%`}
            </p>
          </div>
          <button onClick={() => delMut.mutate(d.id)}
            className="p-2 rounded-full transition-all hover:bg-red-500/10 active:scale-90"
            style={{ color: "var(--text-muted)" }}>
            <Trash2 size={15} />
          </button>
        </div>
        );
      })}

      {/* Smart add — just type what you drink */}
      {!parsed && (
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {t("profile.drinkHint")}
          </p>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && text.trim() && parseMut.mutate()}
              placeholder={t("profile.drinkPlaceholder")}
              className="flex-1 rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <button
              onClick={() => parseMut.mutate()}
              disabled={!text.trim() || parsing}
              className="px-4 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
            >
              {parsing ? <Loader2 size={16} className="animate-spin" /> : t("log.analyze")}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      )}

      {/* Parsed result — review & save */}
      {parsed && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{parsed.icon}</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{parsed.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{parsed.name_he}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-input)" }}>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{parsed.volume_ml}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t("water.ml")}</p>
            </div>
            <div className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-input)" }}>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{parsed.calories}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t("dashboard.kcal")}</p>
            </div>
            <div className="rounded-lg p-2" style={{ backgroundColor: "var(--bg-input)" }}>
              <div className="flex items-center justify-center gap-1">
                <input type="number" min={0} max={100} value={parsed.water_pct}
                  onChange={(e) => setParsed((p) => p ? { ...p, water_pct: Math.min(100, Math.max(0, +e.target.value || 0)) } : p)}
                  className="w-12 text-center text-lg font-bold bg-transparent outline-none"
                  style={{ color: "var(--text-primary)" }} />
                <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>%</span>
              </div>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>💧 {t("profile.waterContent")}</p>
            </div>
          </div>

          <div className="flex gap-3 text-[11px] justify-center" style={{ color: "var(--text-muted)" }}>
            <span>{t("macros.protein")}: {parsed.protein_g}{t("log.g")}</span>
            <span>{t("macros.fat")}: {parsed.fat_g}{t("log.g")}</span>
            <span>{t("macros.carbs")}: {parsed.carbs_g}{t("log.g")}</span>
            <span>{t("profile.sugar")}: {parsed.sugar_g}{t("log.g")}</span>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setParsed(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)" }}>
              {t("profile.cancel")}
            </button>
            <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
              {t("profile.save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
