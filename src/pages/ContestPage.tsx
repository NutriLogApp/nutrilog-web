import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trophy, Crown, Users, Plus, Flame } from "lucide-react";
import { getProfile } from "@/services/profileService";
import { listGroups, getLeaderboard, getWeekPoints } from "@/services/socialService";

export default function ContestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const enabled = !!profile?.username;
  const { data: groups } = useQuery({ queryKey: ["groups"], queryFn: listGroups, enabled });
  const { data: weekPts } = useQuery({ queryKey: ["weekPoints"], queryFn: getWeekPoints, enabled });

  const firstGroup = groups?.[0];
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", firstGroup?.group_id],
    queryFn: () => getLeaderboard(firstGroup!.group_id),
    enabled: !!firstGroup,
  });

  // No username — prompt to set one
  if (!profile?.username) {
    return (
      <div className="px-5 pt-8 pb-4 max-w-lg mx-auto flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "color-mix(in srgb, var(--theme-accent) 12%, transparent)" }}>
          <Users size={24} style={{ color: "var(--theme-accent)" }} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-center mb-1.5" style={{ color: "var(--text-primary)" }}>
          {t("contest.needUsername")}
        </h1>
        <p className="text-[13px] text-center mb-6 max-w-[260px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {t("contest.needUsernameDesc")}
        </p>
        <button onClick={() => navigate("/profile")}
          className="px-7 py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
          {t("contest.goToProfile")}
        </button>
      </div>
    );
  }

  // No groups — CTA
  if (!firstGroup) {
    return (
      <div className="px-5 pt-8 pb-4 max-w-lg mx-auto flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
        <Trophy size={40} strokeWidth={1.2} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: 20 }} />
        <h1 className="text-xl font-bold tracking-tight text-center mb-1.5" style={{ color: "var(--text-primary)" }}>
          {t("contest.noCompetitions", "No competitions yet")}
        </h1>
        <p className="text-[13px] text-center mb-6 max-w-[240px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {t("contest.addFriendsToStart", "Add friends to start competing")}
        </p>
        <button onClick={() => navigate("/profile")}
          className="px-7 py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
          {t("contest.findFriends", "Find Friends")}
        </button>
      </div>
    );
  }

  // Has group — show leaderboard
  const me = leaderboard?.standings.find((s) => s.is_current_user);

  return (
    <div className="px-5 pt-8 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 animate-fade-up">
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{firstGroup.name}</h1>
        {me && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "color-mix(in srgb, var(--theme-accent) 12%, transparent)" }}>
            <Flame size={14} style={{ color: "var(--theme-accent)" }} />
            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>{me.total_points}</span>
          </div>
        )}
      </div>
      <p className="text-[13px] font-medium mb-6 animate-fade-up" style={{ color: "var(--text-muted)" }}>
        {t("contest.weeklyStandings")}
      </p>

      {/* Podium — top 3 */}
      {leaderboard && leaderboard.standings.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-6 animate-fade-up stagger-1">
          {[1, 0, 2].map((idx) => {
            const s = leaderboard.standings[idx];
            if (!s) return null;
            const isFirst = s.rank === 1;
            return (
              <div key={s.user_id} className="flex flex-col items-center" style={{ order: idx }}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${isFirst ? "w-14 h-14" : ""}`}
                  style={isFirst
                    ? { background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))", boxShadow: "0 4px 16px color-mix(in srgb, var(--theme-start) 30%, transparent)" }
                    : { backgroundColor: "var(--bg-input)" }}>
                  {isFirst ? <Crown size={20} color="white" /> : <span className="font-bold text-sm" style={{ color: "var(--text-secondary)" }}>{s.rank}</span>}
                </div>
                <p className="text-[11px] font-semibold truncate max-w-16 text-center" style={{ color: s.is_current_user ? "var(--theme-accent)" : "var(--text-primary)" }}>
                  {s.is_current_user ? t("contest.you") : (s.username || s.name.split(" ")[0])}
                </p>
                <p className="text-lg font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>{s.total_points}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full standings */}
      <div className="space-y-2 animate-fade-up stagger-2">
        {leaderboard?.standings.map((s) => (
          <div key={s.user_id} className="glass-card-sm flex items-center p-3.5 gap-3"
            style={s.is_current_user ? { border: "1.5px solid var(--theme-accent)" } : {}}>
            <span className="w-6 text-center text-xs font-bold tabular-nums" style={{ color: "var(--text-muted)" }}>{s.rank}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[13px] truncate" style={{ color: "var(--text-primary)" }}>
                {s.username || s.name} {s.is_current_user && <span style={{ color: "var(--theme-accent)" }}>({t("contest.you")})</span>}
              </p>
              <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{s.days_logged}/{s.days_in_week} {t("groups.days")}</p>
            </div>
            <span className="text-base font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>{s.total_points}</span>
          </div>
        ))}
      </div>

      {/* Weekly breakdown */}
      {weekPts && weekPts.days.length > 0 && (
        <div className="glass-card p-4 mt-5 animate-fade-up stagger-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            {t("contest.yourWeek")}
          </h3>
          <div className="flex justify-around">
            {weekPts.days.map((d: { date: string; total_points: number }) => {
              const dayName = new Date(d.date + "T12:00:00").toLocaleDateString(undefined, { weekday: "narrow" });
              return (
                <div key={d.date} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums"
                    style={d.total_points > 0
                      ? { background: "color-mix(in srgb, var(--theme-accent) 15%, transparent)", color: "var(--theme-accent)" }
                      : { backgroundColor: "var(--bg-input)", color: "var(--text-muted)" }}>
                    {d.total_points}
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-5 animate-fade-up stagger-4">
        {groups.length < 2 && (
          <button onClick={() => navigate("/contest/groups/new")}
            className="flex-1 glass-card-sm py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.97]"
            style={{ color: "var(--theme-accent)" }}>
            <Plus size={15} /> {t("contest.newGroup")}
          </button>
        )}
        <button onClick={() => navigate("/profile")}
          className="flex-1 glass-card-sm py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.97]"
          style={{ color: "var(--theme-accent)" }}>
          <Users size={15} /> {t("contest.inviteFriends")}
        </button>
      </div>
    </div>
  );
}
