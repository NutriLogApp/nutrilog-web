import { useTranslation } from "react-i18next";

interface Props {
  label: string;
  value: number;
  goal: number | null;
  color: string;
}

export default function MacroCard({ label, value, goal, color }: Props) {
  const { t } = useTranslation();
  const pct = goal ? Math.min(value / goal, 1) : 0;

  return (
    <div className="bg-white rounded-xl p-3 flex-1 shadow-sm">
      <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>
        {Math.round(value)}
        <span className="text-xs font-normal text-slate-400">{t("log.g")}</span>
      </p>
      {goal != null && (
        <>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct * 100}%`, backgroundColor: color }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {t("dashboard.max")} {goal}{t("log.g")}
          </p>
        </>
      )}
    </div>
  );
}
