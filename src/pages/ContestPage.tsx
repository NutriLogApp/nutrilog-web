import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Users, Crown, Lightbulb, Info } from "lucide-react";
import { getProfile } from "@/services/profileService";
import {
  getFriendsLeaderboard,
  setUsername,
} from "@/services/socialService";
import type { Standing } from "@/services/socialService";
import AddFriendModal from "@/components/shared/AddFriendModal";
import DevScenarioPanel from "@/components/contest/DevScenarioPanel";

function formatDateRange(weekStart: string): string {
  const start = new Date(weekStart + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
}

export default function ContestPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const enabled = !!profile?.username;

  const { data: leaderboard } = useQuery({
    queryKey: ["friendsLeaderboard"],
    queryFn: getFriendsLeaderboard,
    enabled,
  });

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInfo) return;
    function handleTapOutside(e: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) setShowInfo(false);
    }
    document.addEventListener("mousedown", handleTapOutside);
    return () => document.removeEventListener("mousedown", handleTapOutside);
  }, [showInfo]);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const usernameMutation = useMutation({
    mutationFn: (name: string) => setUsername(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setUsernameError("");
    },
    onError: (err: Error) => {
      setUsernameError(err.message || t("friends.usernameTaken"));
    },
  });

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

  // --- State 2: No Username ---
  if (!profile?.username) {
    return (
      <div className="px-5 pt-8 pb-4 flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "color-mix(in srgb, var(--theme-accent) 12%, transparent)" }}
        >
          <Users size={24} style={{ color: "var(--theme-accent)" }} />
        </div>
        <h1
          className="text-xl font-bold tracking-tight text-center mb-1.5"
          style={{ color: "var(--text-primary)" }}
        >
          {t("contest.pickUsername")}
        </h1>
        <p
          className="text-[13px] text-center mb-6 max-w-[260px] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {t("contest.pickUsernameDesc")}
        </p>
        <div className="w-full max-w-[280px] space-y-3">
          <input
            value={usernameInput}
            onChange={(e) => {
              setUsernameInput(e.target.value);
              setUsernameError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && usernameInput.trim()) usernameMutation.mutate(usernameInput.trim());
            }}
            placeholder={t("friends.username")}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{
              backgroundColor: "var(--bg-input)",
              border: usernameError ? "1px solid #ef4444" : "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
          {usernameError && (
            <p className="text-xs" style={{ color: "#ef4444" }}>{usernameError}</p>
          )}
          <button
            onClick={() => usernameInput.trim() && usernameMutation.mutate(usernameInput.trim())}
            disabled={!usernameInput.trim() || usernameMutation.isPending}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
          >
            {usernameMutation.isPending ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
            ) : (
              t("contest.save")
            )}
          </button>
        </div>
        <DevScenarioPanel />
      </div>
    );
  }

  // --- State 3: No Friends ---
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
          <div ref={infoRef} className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="p-0.5 rounded-full transition-all active:scale-90"
              style={{ color: "var(--text-muted)" }}
            >
              <Info size={14} />
            </button>
            {showInfo && (
              <div
                className="absolute z-50 p-3.5 rounded-2xl"
                style={{
                  top: "calc(100% + 8px)",
                  left: 0,
                  width: "calc(100vw - 40px)",
                  maxWidth: "280px",
                  background: "var(--bg-elevated)",
                  backdropFilter: "var(--blur)",
                  WebkitBackdropFilter: "var(--blur)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-elevated)",
                }}
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
              >
                <p className="text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                  {t("contest.infoTitle")}
                </p>
                <p className="text-[11px] leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                  {t("contest.infoBody")}
                </p>
              </div>
            )}
          </div>
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
          <LeaderboardRow key={s.user_id} standing={s} t={t} />
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

      <DevScenarioPanel />
    </div>
  );
}

function LeaderboardRow({ standing: s, t }: { standing: Standing; t: (key: string) => string }) {
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

  // Avatar styles
  const avatarBg = s.is_current_user
    ? "color-mix(in srgb, var(--theme-accent) 15%, transparent)"
    : "var(--bg-input)";
  const avatarColor = s.is_current_user ? "var(--theme-accent)" : "var(--text-secondary)";

  const displayName = s.username || s.name;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className="glass-card-sm p-3 flex items-center gap-3"
      style={rowStyle}
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
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: avatarBg }}
      >
        <span className="text-[13px] font-bold" style={{ color: avatarColor }}>
          {initial}
        </span>
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
          {displayName}
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
    </div>
  );
}
