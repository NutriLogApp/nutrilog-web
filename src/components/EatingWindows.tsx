import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEatingWindows, updateEatingWindows, type EatingWindowItem } from "@/services/petService";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

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

  const labels: Record<string, string> = {
    breakfast: t("profile.breakfast"),
    lunch: t("profile.lunch"),
    dinner: t("profile.dinner"),
  };

  return (
    <div className="space-y-4">
      {local.map((w, i) => (
        <div key={w.meal_type}>
          <p className="text-sm font-medium text-slate-700 mb-1">{labels[w.meal_type] ?? w.meal_type}</p>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={w.start_time}
              onChange={(e) => update(i, "start_time", e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
            <span className="text-slate-400">—</span>
            <input
              type="time"
              value={w.end_time}
              onChange={(e) => update(i, "end_time", e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => saveMut.mutate()}
        disabled={saveMut.isPending}
        className="w-full py-2.5 rounded-lg text-white text-sm font-medium"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
      >
        {t("profile.save")}
      </button>
    </div>
  );
}
