import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Crown, Lightbulb, Info } from "lucide-react";
import { getProfile } from "@/services/profileService";
import {
  getFriendsLeaderboard,
} from "@/services/socialService";
import type { Standing } from "@/services/socialService";
import AddFriendModal from "@/components/shared/AddFriendModal";
import Avatar from "@/components/shared/Avatar";
import FriendProfileModal from "@/components/profile/FriendProfileModal";
import DevScenarioPanel from "@/components/contest/DevScenarioPanel";
import i18n from "@/i18n";

function formatDateRange(weekStart: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const locale = i18n.language === "he" ? "he-IL" : "en-US";
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { month: "long", day: "numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
}

export default function ContestPage() {
  const { t } = useTranslation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["friendsLeaderboard"],
    queryFn: getFriendsLeaderboard,
    enabled: !!profile,
  });

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [infoPos, setInfoPos] = useState<{ top: number; left: number } | null>(null);
  const infoBtnRef = useRef<HTMLButtonElement>(null);
  const infoPopupRef = useRef<HTMLDivElement>(null);

  const toggleInfo = () => {
    if (infoPos) {
      // Close
      setInfoPos(null);
    } else if (infoBtnRef.current) {
      // Open — capture position immediately
      const rect = infoBtnRef.current.getBoundingClientRect();
      setInfoPos({ top: rect.bottom + 8, left: rect.left });
    }
  };

  useEffect(() => {
    if (!infoPos) return;
    let active = false;
    // Wait 2 frames to avoid the opening tap triggering dismiss
    requestAnimationFrame(() => requestAnimationFrame(() => { active = true; }));
    function handleTapOutside(e: Event) {
      if (!active) return;
      const target = e.target as Node;
      if (infoBtnRef.current?.contains(target)) return;
      if (infoPopupRef.current?.contains(target)) return;
      setInfoPos(null);
    }
    document.addEventListener("pointerdown", handleTapOutside);
    return () => document.removeEventListener("pointerdown", handleTapOutside);
  }, [infoPos]);
  // --- State 1: Loading ---
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--theme-accent)", borderTopColor: "transparent" }}
        />
        <DevScenarioPanel />
      </div>
    );
  }

  // --- State 2: No Friends ---
  if (leaderboard && leaderboard.standings.length === 1) {
    const me = leaderboard.standings[0];
    return (
      <div className="px-5 pt-8 pb-4">
        <div
          className="glass-card p-6 flex flex-col items-center text-center"
          style={{ border: "1px solid color-mix(in srgb, var(--theme-accent) 12%, var(--border))" }}
        >
          {/* Overlapping avatar circles */}
          <div className="flex items-center justify-center mb-5 -space-x-3">
            {[12, 15, 10].map((pct, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2"
                style={{
                  background: `color-mix(in srgb, var(--theme-accent) ${pct}%, transparent)`,
                  borderColor: "var(--bg-card)",
                }}
              />
            ))}
          </div>
          <h2
            className="text-xl font-bold tracking-tight mb-1.5"
            style={{ color: "var(--text-primary)" }}
          >
            {t("contest.competeWithFriends")}
          </h2>
          <p
            className="text-[13px] leading-relaxed mb-5 max-w-[260px]"
            style={{ color: "var(--text-muted)" }}
          >
            {t("contest.addFriendsToCompete")}
          </p>
          <button
            onClick={() => setShowAddFriend(true)}
            className="w-full max-w-[240px] py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
          >
            {t("contest.addFriends")}
          </button>
          <p
            className="text-[13px] font-medium mt-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("contest.you")}: {me.total_points} {t("contest.yourPoints").toLowerCase()}
          </p>
        </div>
        <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} />
        <DevScenarioPanel />
      </div>
    );
  }

  // --- State 4: Leaderboard ---
  const standings = leaderboard?.standings ?? [];
  const allZeroPoints = standings.length > 0 && standings.every((s) => s.total_points === 0);

  return (
    <div className="px-5 pt-8 pb-4">
      {/* Header */}
      <div className="mb-5 animate-fade-up">
        <div className="flex items-center gap-2">
          <p
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {t("contest.thisWeek")}
          </p>
          <button
            ref={infoBtnRef}
            onClick={toggleInfo}
            className="p-0.5 rounded-full transition-all active:scale-90"
            style={{ color: "var(--text-muted)" }}
          >
            <Info size={14} />
          </button>
        </div>
        <h1
          className="text-[22px] font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {leaderboard ? formatDateRange(leaderboard.week_start) : ""}
        </h1>
      </div>

      {/* Leaderboard rows */}
      <div className="space-y-2 animate-fade-up stagger-1">
        {standings.map((s) => (
          <LeaderboardRow key={s.user_id} standing={s} t={t} onProfileClick={(id) => setProfileUserId(id)} />
        ))}
      </div>

      {/* All zeros tip */}
      {allZeroPoints && (
        <div
          className="glass-card p-4 mt-4 flex items-start gap-3 animate-fade-up stagger-2"
          style={{ border: "1px solid color-mix(in srgb, var(--theme-accent) 12%, var(--border))" }}
        >
          <Lightbulb size={18} style={{ color: "var(--theme-accent)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {t("contest.newWeekTip")}
          </p>
        </div>
      )}

      {/* Info tooltip - fixed position to escape backdrop-filter stacking contexts */}
      {infoPos && (
        <div
          ref={infoPopupRef}
          className="fixed z-[9999] p-3.5 rounded-2xl"
          style={{
            top: infoPos.top,
            left: infoPos.left,
            width: 280,
            background: "var(--bg-elevated)",
            backdropFilter: "var(--blur)",
            WebkitBackdropFilter: "var(--blur)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          <p className="text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
            {t("contest.infoTitle")}
          </p>
          <p className="text-[11px] leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
            {t("contest.infoBody")}
          </p>
        </div>
      )}

      <FriendProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      <DevScenarioPanel />
    </div>
  );
}

function LeaderboardRow({ standing: s, t, onProfileClick }: { standing: Standing; t: (key: string) => string; onProfileClick: (userId: string) => void }) {
  const isTop3 = s.rank <= 3;

  // Top 3 tinted backgrounds
  const tintStyles: Record<number, React.CSSProperties> = {
    1: {
      background: "color-mix(in srgb, var(--theme-accent) 10%, var(--bg-card))",
      border: "1px solid color-mix(in srgb, var(--theme-accent) 20%, var(--border))",
    },
    2: {
      background: "color-mix(in srgb, var(--theme-accent) 6%, var(--bg-card))",
      border: "1px solid color-mix(in srgb, var(--theme-accent) 12%, var(--border))",
    },
    3: {
      background: "color-mix(in srgb, var(--theme-accent) 3%, var(--bg-card))",
      border: "1px solid color-mix(in srgb, var(--theme-accent) 8%, var(--border))",
    },
  };

  // Current user highlighting
  let rowStyle: React.CSSProperties = {};
  if (isTop3) {
    rowStyle = { ...tintStyles[s.rank] };
    if (s.is_current_user) {
      rowStyle.boxShadow = "inset 3px 0 0 var(--theme-accent)";
    }
  } else if (s.is_current_user) {
    rowStyle = { border: "1.5px solid var(--theme-accent)" };
  }

  // Rank display
  const rankColor = s.rank <= 3 ? "var(--theme-accent)" : "var(--text-muted)";

  // Points color
  const pointsColor =
    s.rank === 1 || s.is_current_user
      ? "var(--theme-accent)"
      : s.rank <= 3
        ? "var(--text-primary)"
        : "var(--text-secondary)";

  return (
    <button
      className="glass-card-sm p-3 flex items-center gap-3 w-full text-start"
      style={rowStyle}
      onClick={() => !s.is_current_user && onProfileClick(s.user_id)}
      disabled={s.is_current_user}
    >
      {/* Rank */}
      <div className="w-6 text-center">
        {s.rank === 1 ? (
          <Crown size={14} style={{ color: "var(--theme-accent)", margin: "0 auto" }} />
        ) : (
          <span
            className="text-[13px] font-bold tabular-nums"
            style={{ color: rankColor }}
          >
            {s.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <Avatar name={s.name || s.username || "?"} avatarUrl={s.avatar_url} size="sm" userId={s.user_id} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
          {s.name || s.username || "?"}
          {s.is_current_user && (
            <span style={{ color: "var(--theme-accent)" }}> ({t("contest.you")})</span>
          )}
        </p>
        <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
          {s.days_logged}/{s.days_in_week} {t("contest.days")}
        </p>
      </div>

      {/* Points */}
      <span
        className="text-[17px] font-bold tabular-nums"
        style={{ color: pointsColor }}
      >
        {s.total_points}
      </span>
    </button>
  );
}
