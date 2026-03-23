interface Props {
  label: string;
  value: number;
  goal: number | null;
  unit?: string;
  color: string;
}

export default function MacroCard({ label, value, goal, unit = "g", color }: Props) {
  const pct = goal ? Math.min(value / goal, 1) : 0;

  return (
    <div className="bg-white rounded-xl p-3 flex-1 shadow-sm">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-900">
        {Math.round(value)}
        <span className="text-xs font-normal text-slate-400">{unit}</span>
      </p>
      {goal && (
        <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct * 100}%`, backgroundColor: color }}
          />
        </div>
      )}
    </div>
  );
}
