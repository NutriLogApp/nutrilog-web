import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEatingWindows, updateEatingWindows, type EatingWindowItem } from "@/services/petService";
import { useState, useEffect } from "react";

export default function EatingWindows() {
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["eatingWindows"] }),
  });

  function update(idx: number, field: "start_time" | "end_time", value: string) {
    setLocal((prev) =>
      prev.map((w, i) => (i === idx ? { ...w, [field]: value } : w)),
    );
  }

  if (!local.length) return null;

  const labels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <h2 className="font-semibold text-slate-700 mb-3">Eating Windows</h2>
      <div className="space-y-3">
        {local.map((w, i) => (
          <div key={w.meal_type} className="flex items-center gap-2">
            <span className="text-sm text-slate-600 w-20">{labels[w.meal_type] ?? w.meal_type}</span>
            <input
              type="time"
              value={w.start_time}
              onChange={(e) => update(i, "start_time", e.target.value)}
              className="border border-slate-200 rounded px-2 py-1 text-sm"
            />
            <span className="text-slate-400">—</span>
            <input
              type="time"
              value={w.end_time}
              onChange={(e) => update(i, "end_time", e.target.value)}
              className="border border-slate-200 rounded px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => saveMut.mutate()}
        disabled={saveMut.isPending}
        className="w-full mt-3 py-2 rounded-lg text-white text-sm font-medium"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
      >
        Save
      </button>
    </div>
  );
}
