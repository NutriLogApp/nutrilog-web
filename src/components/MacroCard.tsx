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
    <div className="rounded-xl p-3 flex-1" style={{ backgroundColor: "var(--bg-card)" }}>
      <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-xl font-bold" style={{ color }}>
        {Math.round(value)}
        <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>{t("log.g")}</span>
      </p>
      {goal != null && (
        <>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
            {t("dashboard.max")} {goal}{t("log.g")}
          </p>
        </>
      )}
    </div>
  );
}
