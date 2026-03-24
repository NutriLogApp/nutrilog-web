import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEatingWindows, updateEatingWindows, type EatingWindowItem } from "@/services/eatingWindowsService";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sunrise, Sun, Moon } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function EatingWindows({ onClose }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: windows } = useQuery({
    queryKey: ["eatingWindows"],
    queryFn: getEatingWindows,
  });

  const [local, setLocal] = useState<EatingWindowItem[]>([]);

  useEffect(() => {
    if (windows) setLocal(windows);
  }, [windows]);

  const saveMut = useMutation({
    mutationFn: () => updateEatingWindows(local),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eatingWindows"] });
      onClose();
    },
  });

  function update(idx: number, field: "start_time" | "end_time", value: string) {
    setLocal((prev) =>
      prev.map((w, i) => (i === idx ? { ...w, [field]: value } : w)),
    );
  }

  if (!local.length) return null;

  const mealConfig: Record<string, { label: string; icon: React.ElementType }> = {
    breakfast: { label: t("profile.breakfast"), icon: Sunrise },
    lunch: { label: t("profile.lunch"), icon: Sun },
    dinner: { label: t("profile.dinner"), icon: Moon },
  };

  return (
    <div className="space-y-3">
      {local.map((w, i) => {
        const config = mealConfig[w.meal_type] ?? { label: w.meal_type, icon: Sun };
        const Icon = config.icon;
        return (
          <div key={w.meal_type} className="glass-card p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
              <Icon size={18} color="white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>{config.label}</p>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={w.start_time}
                  onChange={(e) => update(i, "start_time", e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 text-sm font-medium tabular-nums"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                <input
                  type="time"
                  value={w.end_time}
                  onChange={(e) => update(i, "end_time", e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 text-sm font-medium tabular-nums"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                />
              </div>
            </div>
          </div>
        );
      })}
      <button
        onClick={() => saveMut.mutate()}
        disabled={saveMut.isPending}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
      >
        {t("profile.save")}
      </button>
    </div>
  );
}
