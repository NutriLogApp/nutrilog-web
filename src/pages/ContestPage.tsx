import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Trophy, Crown, Users, UserPlus, Plus, Flame, LogOut,
  ChevronDown, ChevronUp, Lightbulb, User,
} from "lucide-react";
import { getProfile } from "@/services/profileService";
import {
  listGroups, getLeaderboard, getWeekPoints,
  listFriends, getFriendRequests, respondToRequest,
  setUsername, leaveGroup,
} from "@/services/socialService";
import AddFriendModal from "@/components/shared/AddFriendModal";
import DevScenarioPanel from "@/components/contest/DevScenarioPanel";

export default function ContestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const enabled = !!profile?.username;

  const { data: groups } = useQuery({ queryKey: ["groups"], queryFn: listGroups, enabled });
  const { data: friends } = useQuery({ queryKey: ["friends"], queryFn: listFriends, enabled });
  const { data: requests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    enabled,
  });
  const { data: weekPts } = useQuery({ queryKey: ["weekPoints"], queryFn: getWeekPoints, enabled });

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [requestsExpanded, setRequestsExpanded] = useState(false);

  // Username inline setup state
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

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
      setSelectedGroupIndex(0);
    },
  });

  const activeGroup = groups?.[selectedGroupIndex] ?? groups?.[0];

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", activeGroup?.group_id],
    queryFn: () => getLeaderboard(activeGroup!.group_id),
    enabled: !!activeGroup,
  });

  // --- Fix #3: Loading state with spinner ---
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

  // --- Fix #5: Inline username setup ---
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
          {t("contest.chooseUsername")}
        </h1>
        <p
          className="text-[13px] text-center mb-6 max-w-[260px] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {t("contest.chooseUsernameDesc")}
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

  // --- Fix #1: Differentiated no-group states ---
  if (!activeGroup) {
    const hasFriends = (friends?.length ?? 0) > 0;

    return (
      <div className="px-5 pt-8 pb-4">
        {/* Fix #4: Pending friend requests banner */}
        <PendingRequestsBanner
          requests={requests}
          expanded={requestsExpanded}
          onToggle={() => setRequestsExpanded((v) => !v)}
        />

        <div
          className="glass-card p-5 mt-8"
          style={{ border: "1px solid color-mix(in srgb, var(--theme-accent) 12%, var(--border))" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={18} style={{ color: "var(--theme-accent)" }} />
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              {hasFriends ? t("contest.readyToCompete") : t("contest.noCompetitions")}
            </h2>
          </div>
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
            {hasFriends ? t("contest.createGroupDesc") : t("contest.addFriendsToStart")}
          </p>

          {hasFriends ? (
            <div className="space-y-3">
              <button
                onClick={() => navigate("/contest/groups/new")}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
              >
                {t("contest.createGroup")}
              </button>
              <button
                onClick={() => setShowAddFriend(true)}
                className="w-full text-center text-sm font-medium transition-all active:scale-[0.98]"
                style={{ color: "var(--theme-accent)" }}
              >
                {t("contest.addMoreFriends")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddFriend(true)}
              className="flex items-center gap-1.5 text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ color: "var(--theme-accent)" }}
            >
              <UserPlus size={15} />
              {t("contest.findFriends")}
            </button>
          )}
        </div>
        <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} />
        <DevScenarioPanel />
      </div>
    );
  }

  // --- Has group — show leaderboard ---
  const standings = leaderboard?.standings ?? [];
  const me = standings.find((s) => s.is_current_user);
  const allZeroPoints = standings.length > 0 && standings.every((s) => s.total_points === 0);
  const showPodium = standings.length >= 3;
  const isDuel = standings.length === 2;

  // Fix #7: Filter standings to exclude podium members
  const flatStandings = showPodium ? standings.filter((s) => s.rank > 3) : isDuel ? [] : standings;

  return (
    <div className="px-5 pt-8 pb-4">
      {/* Fix #4: Pending friend requests banner */}
      <PendingRequestsBanner
        requests={requests}
        expanded={requestsExpanded}
        onToggle={() => setRequestsExpanded((v) => !v)}
      />

      {/* Fix #2: Group switcher pills */}
      {groups && groups.length > 1 && (
        <div className="flex gap-2 mb-4 animate-fade-up overflow-x-auto">
          {groups.map((g, idx) => (
            <button
              key={g.group_id}
              onClick={() => setSelectedGroupIndex(idx)}
              className="px-4 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap"
              style={
                idx === selectedGroupIndex
                  ? { backgroundColor: "var(--theme-accent)", color: "#fff" }
                  : { color: "var(--text-muted)" }
              }
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2 animate-fade-up">
        <div className="flex items-center gap-2 min-w-0">
          <h1
            className="text-[26px] font-bold tracking-tight truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {activeGroup.name}
          </h1>
          {/* Fix #10: Leave Group button */}
          <button
            onClick={() => {
              if (window.confirm(t("contest.leaveConfirm"))) {
                leaveGroupMutation.mutate(activeGroup.group_id);
              }
            }}
            className="text-xs font-medium shrink-0 transition-all active:scale-[0.95]"
            style={{ color: "#ef4444" }}
          >
            <LogOut size={14} style={{ color: "#ef4444" }} />
          </button>
        </div>
        {me && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
            style={{ background: "color-mix(in srgb, var(--theme-accent) 12%, transparent)" }}
          >
            <Flame size={14} style={{ color: "var(--theme-accent)" }} />
            <span className="text-sm font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>
              {me.total_points}
            </span>
          </div>
        )}
      </div>
      <p
        className="text-[13px] font-medium mb-6 animate-fade-up"
        style={{ color: "var(--text-muted)" }}
      >
        {t("contest.weeklyStandings")}
      </p>

      {/* Fix #6: Duel layout for 2-member groups */}
      {isDuel && (
        <div className="animate-fade-up stagger-1 mb-6">
          <div className="flex items-stretch gap-3">
            {standings.map((s) => {
              const isLeader = s.rank === 1;
              return (
                <div key={s.user_id} className="flex-1">
                  <div
                    className="glass-card p-4 flex flex-col items-center gap-2 w-full"
                    style={isLeader ? { border: "2px solid var(--theme-accent)" } : {}}
                  >
                    {isLeader && <Crown size={18} style={{ color: "var(--theme-accent)" }} />}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "var(--bg-input)" }}
                    >
                      <User size={20} style={{ color: "var(--text-muted)" }} />
                    </div>
                    <p
                      className="text-[13px] font-semibold truncate max-w-full text-center"
                      style={{ color: s.is_current_user ? "var(--theme-accent)" : "var(--text-primary)" }}
                    >
                      {s.is_current_user ? t("contest.you") : (s.username || s.name.split(" ")[0])}
                    </p>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>
                      {s.total_points}
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                      {s.days_logged}/{s.days_in_week} {t("groups.days")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center -mt-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--theme-accent) 10%, transparent)",
                color: "var(--theme-accent)",
              }}
            >
              {t("contest.vs")}
            </span>
          </div>
        </div>
      )}

      {/* Podium -- top 3 */}
      {showPodium && (
        <div className="flex items-end justify-center gap-3 mb-6 animate-fade-up stagger-1">
          {[1, 0, 2].map((idx) => {
            const s = standings[idx];
            if (!s) return null;
            const isFirst = s.rank === 1;
            return (
              <div key={s.user_id} className="flex flex-col items-center" style={{ order: idx }}>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${isFirst ? "w-14 h-14" : ""}`}
                  style={
                    isFirst
                      ? {
                          background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
                          boxShadow: "0 4px 16px color-mix(in srgb, var(--theme-start) 30%, transparent)",
                        }
                      : { backgroundColor: "var(--bg-input)" }
                  }
                >
                  {isFirst ? (
                    <Crown size={20} color="white" />
                  ) : (
                    <span className="font-bold text-sm" style={{ color: "var(--text-secondary)" }}>
                      {s.rank}
                    </span>
                  )}
                </div>
                <p
                  className="text-[11px] font-semibold truncate max-w-16 text-center"
                  style={{ color: s.is_current_user ? "var(--theme-accent)" : "var(--text-primary)" }}
                >
                  {s.is_current_user ? t("contest.you") : (s.username || s.name.split(" ")[0])}
                </p>
                <p className="text-lg font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>
                  {s.total_points}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Fix #7: Full standings (rank 4+ when podium shown, or all when no podium/duel) */}
      {flatStandings.length > 0 && (
        <div className="space-y-2 animate-fade-up stagger-2">
          {flatStandings.map((s) => (
            <div
              key={s.user_id}
              className="glass-card-sm flex items-center p-3.5 gap-3"
              style={s.is_current_user ? { border: "1.5px solid var(--theme-accent)" } : {}}
            >
              <span
                className="w-6 text-center text-xs font-bold tabular-nums"
                style={{ color: "var(--text-muted)" }}
              >
                {s.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px] truncate" style={{ color: "var(--text-primary)" }}>
                  {s.username || s.name}{" "}
                  {s.is_current_user && (
                    <span style={{ color: "var(--theme-accent)" }}>({t("contest.you")})</span>
                  )}
                </p>
                <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                  {s.days_logged}/{s.days_in_week} {t("groups.days")}
                </p>
              </div>
              <span className="text-base font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>
                {s.total_points}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Fix #8: Zero-points guidance */}
      {allZeroPoints && (
        <div
          className="glass-card p-4 mt-4 flex items-start gap-3 animate-fade-up stagger-2"
          style={{ border: "1px solid color-mix(in srgb, var(--theme-accent) 12%, var(--border))" }}
        >
          <Lightbulb size={18} style={{ color: "var(--theme-accent)", flexShrink: 0, marginTop: 2 }} />
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {t("contest.startLogging")}
          </p>
        </div>
      )}

      {/* Weekly breakdown */}
      {weekPts && weekPts.days.length > 0 && (
        <div className="glass-card p-4 mt-5 animate-fade-up stagger-3">
          <h3
            className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            {t("contest.yourWeek")}
          </h3>
          <div className="flex justify-around">
            {weekPts.days.map((d: { date: string; total_points: number }) => {
              const dayName = new Date(d.date + "T12:00:00").toLocaleDateString(undefined, {
                weekday: "narrow",
              });
              return (
                <div key={d.date} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums"
                    style={
                      d.total_points > 0
                        ? {
                            background: "color-mix(in srgb, var(--theme-accent) 15%, transparent)",
                            color: "var(--theme-accent)",
                          }
                        : { backgroundColor: "var(--bg-input)", color: "var(--text-muted)" }
                    }
                  >
                    {d.total_points}
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions — Fix #9: Renamed "Invite Friends" to "Add Friends" */}
      <div className="flex gap-3 mt-5 animate-fade-up stagger-4">
        {(groups?.length ?? 0) < 2 && (
          <button
            onClick={() => navigate("/contest/groups/new")}
            className="flex-1 glass-card-sm py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.97]"
            style={{ color: "var(--theme-accent)" }}
          >
            <Plus size={15} /> {t("contest.newGroup")}
          </button>
        )}
        <button
          onClick={() => setShowAddFriend(true)}
          className="flex-1 glass-card-sm py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-[0.97]"
          style={{ color: "var(--theme-accent)" }}
        >
          <Users size={15} /> {t("contest.addFriends")}
        </button>
      </div>
      <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} />
      <DevScenarioPanel />
    </div>
  );
}

// --- Fix #4: Pending friend requests banner component ---
function PendingRequestsBanner({
  requests,
  expanded,
  onToggle,
}: {
  requests: { friendship_id: string; requester: { name: string; username: string | null; user_id: string } }[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const qc = useQueryClient();

  if (requests.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-3.5 mb-4 animate-fade-up"
      style={{
        background: "color-mix(in srgb, var(--theme-accent) 8%, transparent)",
        border: "1px solid color-mix(in srgb, var(--theme-accent) 15%, transparent)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between active:scale-[0.98] transition-transform"
      >
        <span className="text-sm font-semibold" style={{ color: "var(--theme-accent)" }}>
          {t("contest.pendingRequests", { count: requests.length })}
        </span>
        {expanded ? (
          <ChevronUp size={16} style={{ color: "var(--theme-accent)" }} />
        ) : (
          <ChevronDown size={16} style={{ color: "var(--theme-accent)" }} />
        )}
      </button>
      {expanded && (
        <div className="mt-3 space-y-2">
          {requests.map((r) => (
            <div key={r.friendship_id} className="glass-card-sm p-3 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--bg-input)" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {r.requester.name}
                </p>
                {r.requester.username && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    @{r.requester.username}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  respondToRequest(r.friendship_id, "accept").then(() => {
                    qc.invalidateQueries({ queryKey: ["friends"] });
                    qc.invalidateQueries({ queryKey: ["friendRequests"] });
                  })
                }
                className="px-3 py-1 rounded-lg text-white text-xs font-semibold active:scale-[0.95]"
                style={{ background: "var(--theme-accent)" }}
              >
                {t("friends.accept")}
              </button>
              <button
                onClick={() =>
                  respondToRequest(r.friendship_id, "decline").then(() =>
                    qc.invalidateQueries({ queryKey: ["friendRequests"] }),
                  )
                }
                className="px-3 py-1 rounded-lg text-xs font-semibold active:scale-[0.95]"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                {t("friends.decline")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
