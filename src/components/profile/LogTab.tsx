import { useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Pencil, Droplets } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { getProfile } from "@/services/profileService";
import { formatTime } from "@/lib/formatTime";
import EntryEditModal from "@/components/EntryEditModal";
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

function computeWaterMl(entries: EntryOut[]): number {
  let ml = 0;
  for (const e of entries) {
    if (Array.isArray(e.items)) {
      for (const item of e.items) {
        if (item.is_drink) {
          const vol = item.volume_ml ?? item.grams ?? 0;
          const pct = item.water_pct ?? 0;
          ml += Math.round(vol * pct / 100);
        }
      }
    }
  }
  return ml;
}

export default function LogTab({ use24h = true }: Props) {
  const { t } = useTranslation();
  const [dates] = useState(getDateStrings);
  const [todayStr, yesterdayStr] = dates;

  const [editEntry, setEditEntry] = useState<EntryOut | null>(null);
  const [showFullLog, setShowFullLog] = useState(false);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const waterGoal = profile?.daily_water_goal_ml ?? 2000;

  const results = useQueries({
    queries: dates.map((dateStr) => ({
      queryKey: ["dailyStats", dateStr],
      queryFn: () => getDailyStats(dateStr),
    })),
  });

  const groups = dates
    .map((dateStr, i) => {
      const entries = results[i].data?.entries ?? [];
      return {
        dateStr,
        entries,
        totals: {
          cal: entries.reduce((s, e) => s + e.total_calories, 0),
          p: Math.round(entries.reduce((s, e) => s + e.total_protein_g, 0)),
          f: Math.round(entries.reduce((s, e) => s + e.total_fat_g, 0)),
          c: Math.round(entries.reduce((s, e) => s + e.total_carbs_g, 0)),
          waterMl: computeWaterMl(entries),
        },
      };
    })
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

      {groups.map(({ dateStr, entries, totals }) => (
        <div key={dateStr}>
          <div className="mb-2">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {dateLabel(dateStr, todayStr, yesterdayStr, t)}
              </p>
              <p className="text-[10px] font-semibold tabular-nums" style={{ color: "var(--text-muted)" }}>
                {totals.cal} {t("dashboard.kcal")}
              </p>
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold tabular-nums" style={{ color: "#6366f1" }}>{totals.p}<span className="font-bold">{t("macros.proteinShort")}</span></span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>&middot;</span>
              <span className="text-[10px] font-semibold tabular-nums" style={{ color: "#f59e0b" }}>{totals.f}<span className="font-bold">{t("macros.fatShort")}</span></span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>&middot;</span>
              <span className="text-[10px] font-semibold tabular-nums" style={{ color: "#10b981" }}>{totals.c}<span className="font-bold">{t("macros.carbsShort")}</span></span>
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
              const isHe = i18n.language === "he";
              const displayName = entry.items[0]
                ? (isHe && entry.items[0].food_name_he ? entry.items[0].food_name_he : entry.items[0].food_name)
                : entry.description;
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ fontSize: 14, color: "var(--text-primary)" }}>
                      {displayName}
                      {(entry.items[0]?.quantity ?? 1) > 1 && (
                        <span style={{
                          display: "inline-block", fontSize: 10, fontWeight: 600,
                          color: "var(--theme-accent)",
                          background: "color-mix(in srgb, var(--theme-accent) 12%, transparent)",
                          borderRadius: 6, padding: "1px 5px", marginInlineStart: 4, verticalAlign: "middle",
                        }}>
                          x{entry.items[0].quantity}
                        </span>
                      )}
                    </p>
                    <p className="tabular-nums" style={{ fontSize: 11, color: "var(--text-muted)" }}>
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

      {/* Full log modal */}
      <FullLogModal open={showFullLog} onClose={() => setShowFullLog(false)} use24h={use24h} />
    </div>
  );
}
