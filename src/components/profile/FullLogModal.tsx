import { useState, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";
import { getEntryHistory } from "@/services/entriesService";
import { useDeleteEntry } from "@/hooks/useDeleteEntry";
import { formatTime } from "@/lib/formatTime";
import Modal from "@/components/Modal";
import EntryEditModal from "@/components/EntryEditModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { EntryOut } from "@/types/api";

type Cursor = { time: string; id: string } | undefined;

interface Props {
  open: boolean;
  onClose: () => void;
  use24h?: boolean;
}

function groupByDate(entries: EntryOut[]): { dateStr: string; entries: EntryOut[]; totals: { cal: number; p: number; f: number; c: number } }[] {
  const map = new Map<string, EntryOut[]>();
  for (const entry of entries) {
    const dateStr = entry.logged_at.slice(0, 10);
    if (!map.has(dateStr)) map.set(dateStr, []);
    map.get(dateStr)!.push(entry);
  }
  return Array.from(map.entries()).map(([dateStr, entries]) => ({
    dateStr,
    entries,
    totals: {
      cal: entries.reduce((s, e) => s + e.total_calories, 0),
      p: Math.round(entries.reduce((s, e) => s + e.total_protein_g, 0)),
      f: Math.round(entries.reduce((s, e) => s + e.total_fat_g, 0)),
      c: Math.round(entries.reduce((s, e) => s + e.total_carbs_g, 0)),
    },
  }));
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default function FullLogModal({ open, onClose, use24h = true }: Props) {
  const { t } = useTranslation();
  const [editEntry, setEditEntry] = useState<EntryOut | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const deleteMut = useDeleteEntry();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["foodLog"],
    queryFn: ({ pageParam }: { pageParam: Cursor }) =>
      getEntryHistory(pageParam?.time, pageParam?.id, 20),
    initialPageParam: undefined as Cursor,
    getNextPageParam: (lastPage): Cursor =>
      lastPage.has_more && lastPage.next_cursor_time && lastPage.next_cursor_id
        ? { time: lastPage.next_cursor_time, id: lastPage.next_cursor_id }
        : undefined,
    enabled: open,
  });

  // Infinite scroll sentinel
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasNextPage || isFetchingNextPage) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const allEntries = data?.pages.flatMap((p) => p.entries) ?? [];
  const groups = groupByDate(allEntries);

  return (
    <>
      <Modal open={open} onClose={onClose} title={t("profileTabs.foodLog")}>
        {/* Empty state */}
        {groups.length === 0 && !isFetchingNextPage && (
          <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>
            {t("profileTabs.noEntries")}
          </p>
        )}

        {/* Grouped entries */}
        <div className="space-y-5">
          {groups.map(({ dateStr, entries, totals }) => (
            <div key={dateStr}>
              <div className="flex items-baseline justify-between mb-2">
                <p
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDateLabel(dateStr)}
                </p>
                <p
                  className="text-[10px] font-medium tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("profileTabs.dailySummary", { cal: totals.cal, p: totals.p, f: totals.f, c: totals.c })}
                </p>
              </div>

              <div className="space-y-1.5">
                {entries.map((entry) => {
                  const time = formatTime(entry.logged_at, use24h);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
                    >
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
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditEntry(entry)}
                          className="flex items-center justify-center rounded-lg transition-all active:scale-90"
                          style={{ width: 30, height: 30, background: "rgba(139, 92, 246, 0.1)" }}
                          aria-label="Edit"
                        >
                          <Pencil size={14} color="#8b5cf6" />
                        </button>
                        <button
                          onClick={() => setDeleteId(entry.id)}
                          className="flex items-center justify-center rounded-lg transition-all active:scale-90"
                          style={{ width: 30, height: 30, background: "rgba(239, 68, 68, 0.1)" }}
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
        </div>

        {/* Infinite scroll sentinel + loading indicator */}
        <div ref={sentinelRef} className="py-4 text-center">
          {isFetchingNextPage && (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {t("profileTabs.loadingMore")}
            </p>
          )}
        </div>
      </Modal>

      {editEntry && (
        <Modal open={!!editEntry} onClose={() => setEditEntry(null)} title={t("myday.editEntry")}>
          <EntryEditModal entry={editEntry} onClose={() => setEditEntry(null)} />
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteId}
        message={t("common.deleteConfirm")}
        onConfirm={() => {
          if (deleteId) deleteMut.mutate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
