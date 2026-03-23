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
    <div className="glass-card-sm p-3.5 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-2xl font-bold tracking-tight" style={{ color }}>
        {Math.round(value)}
        <span className="text-[11px] font-medium ms-0.5" style={{ color: "var(--text-muted)" }}>{t("log.g")}</span>
      </p>
      {goal != null && (
        <div className="mt-2.5">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct * 100}%`, backgroundColor: color }}
            />
          </div>
          <p className="text-[10px] mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
            / {goal}{t("log.g")}
          </p>
        </div>
      )}
    </div>
  );
}
