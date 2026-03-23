import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trophy, Crown, Users, Plus } from "lucide-react";
import { getProfile } from "@/services/profileService";
import { listGroups, getLeaderboard, getWeekPoints } from "@/services/socialService";
import UsernamePrompt from "@/components/UsernamePrompt";
import { useState } from "react";

export default function ContestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [usernameSet, setUsernameSet] = useState(false);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const enabled = !!profile?.username || usernameSet;
  const { data: groups } = useQuery({ queryKey: ["groups"], queryFn: listGroups, enabled });
  const { data: weekPts } = useQuery({ queryKey: ["weekPoints"], queryFn: getWeekPoints, enabled });

  const firstGroup = groups?.[0];
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", firstGroup?.group_id],
    queryFn: () => getLeaderboard(firstGroup!.group_id),
    enabled: !!firstGroup,
  });

  if (!profile?.username && !usernameSet) {
    return <UsernamePrompt onDone={() => setUsernameSet(true)} />;
  }

  // No groups — show CTA
  if (!firstGroup) {
    return (
      <div className="px-5 pt-8 pb-4 max-w-lg mx-auto flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))", boxShadow: "0 8px 24px color-mix(in srgb, var(--theme-start) 25%, transparent)" }}>
          <Trophy size={36} color="white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-center mb-2" style={{ color: "var(--text-primary)" }}>
          {t("contest.title")}
        </h1>
        <p className="text-sm text-center mb-8 max-w-xs" style={{ color: "var(--text-muted)" }}>
          {t("contest.emptyDesc")}
        </p>
        <button onClick={() => navigate("/profile")}
          className="px-8 py-3.5 rounded-2xl text-white font-semibold transition-all active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))", boxShadow: "0 4px 16px color-mix(in srgb, var(--theme-start) 30%, transparent)" }}>
          {t("contest.addFriendsStart")}
        </button>
      </div>
    );
  }

  // Has group — show leaderboard
  const me = leaderboard?.standings.find((s) => s.is_current_user);

  return (
    <div className="px-5 pt-8 pb-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{firstGroup.name}</h1>
          <p className="text-[13px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
            {t("contest.weeklyStandings")} · {leaderboard?.week_start}
          </p>
        </div>
        {me && (
          <div className="text-end">
            <p className="text-2xl font-bold" style={{ color: "var(--theme-accent)" }}>{me.total_points}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t("groups.pts")}</p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2.5 animate-fade-up stagger-1">
        {leaderboard?.standings.map((s, idx) => (
          <div key={s.user_id}
            className="glass-card-sm flex items-center p-4 gap-3 transition-all"
            style={{
              animationDelay: `${(idx + 1) * 60}ms`,
              ...(s.is_current_user ? { border: "2px solid var(--theme-accent)" } : {}),
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
              style={s.rank === 1
                ? { background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))", color: "white" }
                : { backgroundColor: "var(--bg-input)", color: "var(--text-secondary)" }}>
              {s.rank === 1 ? <Crown size={16} /> : s.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[13px] truncate" style={{ color: "var(--text-primary)" }}>
                {s.name} {s.is_current_user && `(${t("contest.you")})`}
              </p>
              <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                {s.days_logged}/{s.days_in_week} {t("groups.days")}
              </p>
            </div>
            <span className="text-lg font-bold tabular-nums" style={{ color: s.rank <= 3 ? "var(--theme-accent)" : "var(--text-muted)" }}>
              {s.total_points}
            </span>
          </div>
        ))}
      </div>

      {/* Your week points breakdown */}
      {weekPts && (
        <div className="glass-card p-4 mt-5 animate-fade-up stagger-2">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            {t("contest.yourWeek")}
          </h3>
          <div className="flex justify-around text-center">
            {weekPts.days.map((d: { date: string; total_points: number }) => (
              <div key={d.date}>
                <p className="text-lg font-bold" style={{ color: d.total_points > 0 ? "var(--theme-accent)" : "var(--text-muted)" }}>
                  {d.total_points}
                </p>
                <p className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>
                  {d.date.slice(8)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-5 animate-fade-up stagger-3">
        {groups.length < 2 && (
          <button onClick={() => navigate("/contest/groups/new")}
            className="flex-1 glass-card-sm py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
            style={{ color: "var(--theme-accent)" }}>
            <Plus size={16} /> {t("contest.newGroup")}
          </button>
        )}
        <button onClick={() => navigate("/profile")}
          className="flex-1 glass-card-sm py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
          style={{ color: "var(--theme-accent)" }}>
          <Users size={16} /> {t("contest.inviteFriends")}
        </button>
      </div>
    </div>
  );
}
