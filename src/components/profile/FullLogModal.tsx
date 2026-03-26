import { useState, useRef, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Pencil, Droplets } from "lucide-react";
import { getEntryHistory } from "@/services/entriesService";
import { getProfile } from "@/services/profileService";
import { formatTime } from "@/lib/formatTime";
import Modal from "@/components/Modal";
import EntryEditModal from "@/components/EntryEditModal";
import type { EntryOut } from "@/types/api";

type Cursor = { time: string; id: string } | undefined;

interface Props {
  open: boolean;
  onClose: () => void;
  use24h?: boolean;
}

interface DayGroup {
  dateStr: string;
  entries: EntryOut[];
  totals: { cal: number; p: number; f: number; c: number; waterMl: number };
}

function groupByDate(entries: EntryOut[]): DayGroup[] {
  const map = new Map<string, EntryOut[]>();
  for (const entry of entries) {
    const dateStr = entry.logged_at.slice(0, 10);
    if (!map.has(dateStr)) map.set(dateStr, []);
    map.get(dateStr)!.push(entry);
  }
  return Array.from(map.entries()).map(([dateStr, dayEntries]) => {
    let waterMl = 0;
    for (const e of dayEntries) {
      if (Array.isArray(e.items)) {
        for (const item of e.items) {
          if (item.is_drink) {
            const vol = item.volume_ml ?? item.grams ?? 0;
            const pct = item.water_pct ?? 0;
            waterMl += Math.round(vol * pct / 100);
          }
        }
      }
    }
    return {
      dateStr,
      entries: dayEntries,
      totals: {
        cal: dayEntries.reduce((s, e) => s + e.total_calories, 0),
        p: Math.round(dayEntries.reduce((s, e) => s + e.total_protein_g, 0)),
        f: Math.round(dayEntries.reduce((s, e) => s + e.total_fat_g, 0)),
        c: Math.round(dayEntries.reduce((s, e) => s + e.total_carbs_g, 0)),
        waterMl,
      },
    };
  });
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default function FullLogModal({ open, onClose, use24h = true }: Props) {
  const { t } = useTranslation();
  const [editEntry, setEditEntry] = useState<EntryOut | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const waterGoal = profile?.daily_water_goal_ml ?? 2000;

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
              <div className="mb-2">
                <div className="flex items-baseline justify-between">
                  <p
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {formatDateLabel(dateStr)}
                  </p>
                  <p className="text-[10px] font-semibold tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {totals.cal} {t("dashboard.kcal")}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: "#6366f1" }}>{totals.p}<span className="font-bold">P</span></span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>&middot;</span>
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: "#f59e0b" }}>{totals.f}<span className="font-bold">F</span></span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>&middot;</span>
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: "#10b981" }}>{totals.c}<span className="font-bold">C</span></span>
                  {totals.waterMl > 0 && (
                    <>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>&middot;</span>
                      <Droplets size={10} color="#38bdf8" />
                      <span className="text-[10px] font-semibold tabular-nums" style={{ color: "#38bdf8" }}>
                        {Math.round((totals.waterMl / waterGoal) * 100)}%
                      </span>
                    </>
                  )}
                </div>
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
                          {(entry.items[0]?.quantity ?? 1) > 1 && (
                            <span style={{
                              display: "inline-block", fontSize: 10, fontWeight: 600,
                              color: "var(--theme-accent)",
                              background: "color-mix(in srgb, var(--theme-accent) 12%, transparent)",
                              borderRadius: 6, padding: "1px 5px", marginLeft: 4, verticalAlign: "middle",
                            }}>
                              x{entry.items[0].quantity}
                            </span>
                          )}
                        </p>
                        <p
                          className="tabular-nums"
                          style={{ fontSize: 11, color: "var(--text-muted)" }}
                        >
                          {time} · {entry.total_calories} {t("dashboard.kcal")}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditEntry(entry)}
                        className="flex items-center justify-center rounded-lg transition-all active:scale-90 shrink-0"
                        style={{ width: 30, height: 30, background: "rgba(139, 92, 246, 0.1)" }}
                        aria-label="Edit"
                      >
                        <Pencil size={14} color="#8b5cf6" />
                      </button>
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

    </>
  );
}
