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

  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="glass-card p-5 animate-fade-up stagger-1">
      <div className="flex items-center gap-5">
        {/* SVG Ring */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" strokeWidth={strokeWidth}
              style={{ stroke: "var(--bg-input)" }}
            />
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              stroke="url(#calGrad)"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--theme-start)" />
                <stop offset="100%" stopColor="var(--theme-end)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {consumed.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
              {t("dashboard.kcal")}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {t("dashboard.left")}
            </p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {remaining.toLocaleString()}
            </p>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--bg-input)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pctDisplay}%`,
                background: "linear-gradient(90deg, var(--theme-start), var(--theme-end))",
              }}
            />
          </div>
          <p className="text-xs font-medium" style={{ color: "var(--theme-start)" }}>
            {pctDisplay}%
          </p>
        </div>
      </div>
    </div>
  );
}
