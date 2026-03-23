import { useTranslation } from "react-i18next";

interface Props {
  consumed: number;
  goal: number;
}

export default function CalorieRing({ consumed, goal }: Props) {
  const { t } = useTranslation();
  const remaining = Math.max(goal - consumed, 0);
  const pct = Math.min(consumed / (goal || 1), 1);
  const pctDisplay = Math.round(pct * 100);
  const onTrack = pct >= 0.4 && pct <= 1.1;

  return (
    <div
      className="rounded-2xl p-4 text-white"
      style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold">{consumed.toLocaleString()}</p>
          <p className="text-sm opacity-80">{t("dashboard.kcalToday")}</p>
          <p className="text-xs opacity-60 mt-1">
            {pctDisplay}% · {onTrack ? t("dashboard.onTrack") : t("dashboard.offTrack")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{remaining}</p>
          <p className="text-sm opacity-80">{t("dashboard.left")}</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white/80 rounded-full transition-all duration-500"
          style={{ width: `${pctDisplay}%` }}
        />
      </div>
    </div>
  );
}
