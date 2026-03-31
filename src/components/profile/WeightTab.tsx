import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { getWeightHistory, logWeight, updateWeight, deleteWeight } from "@/services/weightService";
import ConfirmDialog from "@/components/ConfirmDialog";
import WeightChart from "./WeightChart";

type RangeDays = 7 | 30 | 90;

const RANGE_OPTIONS: { labelKey: string; days: RangeDays }[] = [
  { labelKey: "profileTabs.7d", days: 7 },
  { labelKey: "profileTabs.30d", days: 30 },
  { labelKey: "profileTabs.90d", days: 90 },
];

export default function WeightTab() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: weightHistory = [] } = useQuery({ queryKey: ["weightHistory"], queryFn: getWeightHistory });

  const [rangeDays, setRangeDays] = useState<RangeDays>(7);
  const [logExpanded, setLogExpanded] = useState(false);
  const [logInput, setLogInput] = useState("");
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteDate, setDeleteDate] = useState<string | null>(null);

  // Filter to range, newest first for display
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - rangeDays + 1);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const filteredAsc = [...weightHistory]
    .filter((w) => w.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const sortedDesc = [...weightHistory].sort((a, b) => b.date.localeCompare(a.date));

  const logMut = useMutation({
    mutationFn: () => logWeight(parseFloat(logInput)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weightHistory"] });
      setLogInput("");
      setLogExpanded(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ date, value }: { date: string; value: number }) => updateWeight(date, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weightHistory"] });
      setEditingDate(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (date: string) => deleteWeight(date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weightHistory"] });
      setDeleteDate(null);
    },
  });

  function startEdit(date: string, currentWeight: number) {
    setEditingDate(date);
    setEditValue(String(currentWeight));
  }

  function cancelEdit() {
    setEditingDate(null);
    setEditValue("");
  }

  function confirmEdit(date: string) {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val > 0) {
      updateMut.mutate({ date, value: val });
    }
  }

  return (
    <div className="space-y-4">
      {/* Range pills */}
      <div className="flex gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.days}
            onClick={() => setRangeDays(opt.days)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={
              rangeDays === opt.days
                ? { background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))", color: "#fff" }
                : { backgroundColor: "var(--bg-input)", color: "var(--text-muted)" }
            }
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>

      {/* Chart or empty state */}
      {filteredAsc.length >= 2 ? (
        <div className="glass-card p-4">
          <WeightChart data={filteredAsc} />
        </div>
      ) : (
        <div className="glass-card p-6 flex items-center justify-center">
          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            {t("profileTabs.noWeightData")}
          </p>
        </div>
      )}

      {/* Log today's weight */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setLogExpanded((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-3.5 active:scale-[0.98] transition-transform"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
          >
            <Plus size={16} color="#fff" />
          </div>
          <span className="flex-1 text-start text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {t("profileTabs.logTodaysWeight")}
          </span>
        </button>
        {logExpanded && (
          <div className="px-4 pb-4 flex gap-2" style={{ borderTop: "1px solid var(--border)" }}>
            <input
              type="number"
              step="0.1"
              min="0"
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder={t("units.kg")}
              autoFocus
              className="flex-1 rounded-xl px-4 py-2.5 text-sm mt-3"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <button
              onClick={() => logMut.mutate()}
              disabled={!logInput || logMut.isPending}
              className="mt-3 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
              style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
            >
              {t("weight.log")}
            </button>
          </div>
        )}
      </div>

      {/* History list */}
      {sortedDesc.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {t("profileTabs.weightHistory")}
            </h3>
          </div>
          {sortedDesc.map((w, i) => (
            <div
              key={w.date}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: i === 0 ? undefined : "1px solid var(--border)" }}
            >
              <span className="flex-1 text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>
                {w.date.slice(8)}/{w.date.slice(5, 7)}
              </span>
              {editingDate === w.date ? (
                <>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    className="w-20 rounded-lg px-2 py-1 text-sm text-center tabular-nums"
                    style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={() => confirmEdit(w.date)}
                    disabled={updateMut.isPending}
                    className="p-1.5 rounded-full transition-all active:scale-90"
                    style={{ color: "var(--theme-accent)" }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 rounded-full transition-all active:scale-90"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {w.weight_kg} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{t("units.kg")}</span>
                  </span>
                  <button
                    onClick={() => startEdit(w.date, w.weight_kg)}
                    className="p-1.5 rounded-full transition-all hover:bg-black/5 active:scale-90"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteDate(w.date)}
                    className="p-1.5 rounded-full transition-all hover:bg-red-500/10 active:scale-90"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteDate}
        message={t("common.deleteConfirm")}
        onConfirm={() => { if (deleteDate) deleteMut.mutate(deleteDate); }}
        onCancel={() => setDeleteDate(null)}
      />
    </div>
  );
}
