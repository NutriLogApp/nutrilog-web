import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPlus, Trophy } from "lucide-react";
import { getProfile } from "@/services/profileService";
import { listFriends, getFriendRequests, respondToRequest, listGroups } from "@/services/socialService";
import UsernamePrompt from "@/components/UsernamePrompt";
import { useState } from "react";

export default function FriendsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [usernameSet, setUsernameSet] = useState(false);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const enabled = !!profile?.username || usernameSet;
  const { data: friends } = useQuery({ queryKey: ["friends"], queryFn: listFriends, enabled });
  const { data: requests } = useQuery({ queryKey: ["friendRequests"], queryFn: getFriendRequests, enabled });
  const { data: groups } = useQuery({ queryKey: ["groups"], queryFn: listGroups, enabled });

  const respondMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => respondToRequest(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendRequests"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  if (!profile?.username && !usernameSet) {
    return <UsernamePrompt onDone={() => setUsernameSet(true)} />;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{t("friends.title")}</h1>
        <button onClick={() => navigate("/friends/add")} className="p-2 rounded-lg" style={{ color: "var(--theme-start)" }}>
          <UserPlus size={20} />
        </button>
      </div>

      {requests && requests.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>{t("friends.pendingRequests")}</h2>
          {requests.map((r) => (
            <div key={r.friendship_id} className="rounded-xl p-3 shadow-sm mb-2 flex items-center gap-3" style={{ backgroundColor: "var(--bg-card)" }}>
              <div className="flex-1">
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{r.requester.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{r.requester.username}</p>
              </div>
              <button onClick={() => respondMut.mutate({ id: r.friendship_id, action: "accept" })} className="text-xs px-3 py-1 rounded-lg bg-emerald-500 text-white">{t("friends.accept")}</button>
              <button onClick={() => respondMut.mutate({ id: r.friendship_id, action: "decline" })} className="text-xs px-3 py-1 rounded-lg" style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)" }}>{t("friends.decline")}</button>
            </div>
          ))}
        </div>
      )}

      {groups && groups.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{t("friends.competitions")}</h2>
            <button onClick={() => navigate("/friends/groups/new")} className="text-xs font-medium" style={{ color: "var(--theme-start)" }}>{t("friends.new")}</button>
          </div>
          {groups.map((g) => (
            <button key={g.group_id} onClick={() => navigate(`/friends/groups/${g.group_id}`)} className="w-full rounded-xl p-3 shadow-sm mb-2 flex items-center gap-3 text-start" style={{ backgroundColor: "var(--bg-card)" }}>
              <Trophy size={18} className="text-amber-500" />
              <div className="flex-1">
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{g.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{g.member_count} {t("groups.members")}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <h2 className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>{t("friends.friendsCount")} ({friends?.length ?? 0})</h2>
      {friends && friends.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>{t("friends.noFriends")}</p>
      )}
      {friends?.map((f) => (
        <div key={f.user_id} className="rounded-xl p-3 shadow-sm mb-2 flex items-center gap-3" style={{ backgroundColor: "var(--bg-card)" }}>
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--bg-input)" }} />
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{f.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{f.username}</p>
          </div>
        </div>
      ))}

      {friends && friends.length > 0 && groups && groups.length === 0 && (
        <button onClick={() => navigate("/friends/groups/new")} className="w-full mt-4 py-3 rounded-lg text-white font-medium" style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
          {t("friends.createCompetition")}
        </button>
      )}
    </div>
  );
}
