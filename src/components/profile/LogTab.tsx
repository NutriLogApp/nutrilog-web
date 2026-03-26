import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { useDeleteEntry } from "@/hooks/useDeleteEntry";

import { formatTime } from "@/lib/formatTime";
import EntryEditModal from "@/components/EntryEditModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Modal from "@/components/Modal";
import FullLogModal from "./FullLogModal";
import type { EntryOut } from "@/types/api";

function getDateStrings(): [string, string, string] {
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dayBefore = new Date(today);
  dayBefore.setDate(today.getDate() - 2);
  return [fmt(today), fmt(yesterday), fmt(dayBefore)];
}

function dateLabel(dateStr: string, todayStr: string, yesterdayStr: string, t: (key: string) => string): string {
  if (dateStr === todayStr) return t("profileTabs.today");
  if (dateStr === yesterdayStr) return t("profileTabs.yesterday");
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

interface Props {
  use24h?: boolean;
}

export default function LogTab({ use24h = true }: Props) {
  const { t } = useTranslation();
  const [dates] = useState(getDateStrings);
  const [todayStr, yesterdayStr] = dates;

  const [editEntry, setEditEntry] = useState<EntryOut | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFullLog, setShowFullLog] = useState(false);

  const deleteMut = useDeleteEntry();

  const results = useQueries({
    queries: dates.map((dateStr) => ({
      queryKey: ["dailyStats", dateStr],
      queryFn: () => getDailyStats(dateStr),
    })),
  });

  const groups = dates
    .map((dateStr, i) => ({ dateStr, entries: results[i].data?.entries ?? [] }))
    .filter((g) => g.entries.length > 0);

  const anyEntries = groups.some((g) => g.entries.length > 0);

  return (
    <div className="space-y-5">
      {!anyEntries && (
        <p
          className="text-sm text-center py-10"
          style={{ color: "var(--text-muted)" }}
        >
          {t("profileTabs.noEntries")}
        </p>
      )}

      {groups.map(({ dateStr, entries }) => (
        <div key={dateStr}>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            {dateLabel(dateStr, todayStr, yesterdayStr, t)}
          </p>

          <div className="space-y-1.5">
            {entries.map((entry) => {
              const time = formatTime(entry.logged_at, use24h);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold truncate"
                      style={{ fontSize: 14, color: "var(--text-primary)" }}
                    >
                      {entry.description}
                    </p>
                    <p
                      className="tabular-nums"
                      style={{ fontSize: 11, color: "var(--text-muted)" }}
                    >
                      {time} · {entry.total_calories} {t("dashboard.kcal")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditEntry(entry)}
                      className="flex items-center justify-center rounded-lg transition-all active:scale-90"
                      style={{
                        width: 30,
                        height: 30,
                        background: "rgba(139, 92, 246, 0.1)",
                      }}
                      aria-label="Edit"
                    >
                      <Pencil size={14} color="#8b5cf6" />
                    </button>
                    <button
                      onClick={() => setDeleteId(entry.id)}
                      className="flex items-center justify-center rounded-lg transition-all active:scale-90"
                      style={{
                        width: 30,
                        height: 30,
                        background: "rgba(239, 68, 68, 0.1)",
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* View full history */}
      <button
        onClick={() => setShowFullLog(true)}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
        style={{
          backgroundColor: "var(--bg-input)",
          color: "var(--theme-accent)",
          border: "1px solid var(--border)",
        }}
      >
        {t("profileTabs.viewFullHistory")}
      </button>

      {/* Edit modal */}
      {editEntry && (
        <Modal open={!!editEntry} onClose={() => setEditEntry(null)} title={t("myday.editEntry")}>
          <EntryEditModal entry={editEntry} onClose={() => setEditEntry(null)} />
        </Modal>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        message={t("common.deleteConfirm")}
        onConfirm={() => {
          if (deleteId) deleteMut.mutate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />

      {/* Full log modal */}
      <FullLogModal open={showFullLog} onClose={() => setShowFullLog(false)} use24h={use24h} />
    </div>
  );
}
