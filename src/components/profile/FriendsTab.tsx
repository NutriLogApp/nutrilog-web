import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Users, Share2, Copy, Check } from "lucide-react";
import { listFriends, getFriendRequests, respondToRequest, getSentRequests, cancelRequest } from "@/services/socialService";
import { getProfile } from "@/services/profileService";
import Modal from "@/components/Modal";
import AddFriendModal from "@/components/shared/AddFriendModal";
import Avatar from "@/components/shared/Avatar";
import FriendProfileModal from "@/components/profile/FriendProfileModal";

export default function FriendsTab() {
  const { t } = useTranslation();
  const { data: friends = [] } = useQuery({ queryKey: ["friends"], queryFn: listFriends });
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [modal, setModal] = useState<"add" | "share" | "all" | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const top4 = friends.slice(0, 4);
  const inviteUrl = `${window.location.origin}/friends/add?code=${profile?.friend_code}`;

  return (
    <div className="space-y-3">
      {/* Top friends row */}
      <div className="flex justify-center gap-4 py-2">
        {top4.map((f) => (
          <button key={f.user_id} className="text-center" onClick={() => setProfileUserId(f.user_id)}>
            <div className="mx-auto">
              <Avatar name={f.name} avatarUrl={f.avatar_url} size="md" userId={f.user_id} />
            </div>
            <div className="text-[11px] font-medium mt-1.5 max-w-[56px] truncate text-center" style={{ color: "var(--text-secondary)" }}>{f.name}</div>
          </button>
        ))}
        {friends.length === 0 && (
          <p className="text-sm py-4" style={{ color: "var(--text-muted)" }}>{t("profileTabs.addFriendEmpty")}</p>
        )}
        <div className="text-center">
          <button onClick={() => setModal("add")} className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ border: "2px dashed var(--border)" }}>
            <Plus size={20} style={{ color: "var(--text-muted)" }} />
          </button>
          <div className="text-[11px] font-medium mt-1.5" style={{ color: "var(--text-muted)" }}>{t("friends.add")}</div>
        </div>
      </div>

      {/* See all friends */}
      <button onClick={() => setModal("all")} className="glass-card p-3.5 w-full flex items-center gap-2.5 active:scale-[0.98] transition-transform">
        <Users size={16} style={{ color: "var(--theme-accent)" }} />
        <span className="flex-1 text-sm font-medium text-start" style={{ color: "var(--text-secondary)" }}>{t("profileTabs.seeAllFriends")}</span>
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>({friends.length})</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      {/* Share invite */}
      <button onClick={() => setModal("share")} className="glass-card p-3.5 w-full flex items-center gap-2.5 active:scale-[0.98] transition-transform">
        <Share2 size={16} style={{ color: "var(--theme-accent)" }} />
        <span className="flex-1 text-sm font-medium text-start" style={{ color: "var(--text-secondary)" }}>{t("profileTabs.shareInvite")}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      {/* Add Friend Modal */}
      <AddFriendModal isOpen={modal === "add"} onClose={() => setModal(null)} />

      {/* Share Invite Modal — cleaned up */}
      <Modal open={modal === "share"} onClose={() => setModal(null)} title={t("friends.inviteFriend")}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("friends.inviteDesc")}</p>
          {profile?.friend_code && (
            <>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "MealRiot", text: t("profile.shareText"), url: inviteUrl });
                  } else {
                    navigator.clipboard.writeText(inviteUrl);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }
                }}
                className="w-full py-3.5 rounded-2xl text-white font-semibold active:scale-[0.97] transition-all"
                style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
              >
                {t("profile.shareLink")}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium active:scale-[0.97] transition-all"
                style={{ background: "var(--bg-input)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                {linkCopied ? <Check size={16} /> : <Copy size={16} />}
                {linkCopied ? t("friends.linkCopied") : t("friends.copyLink")}
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* All Friends Modal */}
      <Modal open={modal === "all"} onClose={() => setModal(null)} title={t("profileTabs.seeAllFriends")}>
        <AllFriendsList onFriendClick={(id) => { setModal(null); setProfileUserId(id); }} />
      </Modal>

      {/* Friend Profile Modal */}
      <FriendProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
    </div>
  );
}

function AllFriendsList({ onFriendClick }: { onFriendClick: (userId: string) => void }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: friends = [] } = useQuery({ queryKey: ["friends"], queryFn: listFriends });
  const { data: requests = [] } = useQuery({ queryKey: ["friendRequests"], queryFn: getFriendRequests });
  const { data: sentRequests = [] } = useQuery({ queryKey: ["sentRequests"], queryFn: getSentRequests });

  const cancelMutation = useMutation({
    mutationFn: cancelRequest,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sentRequests"] }),
  });

  return (
    <div className="space-y-3">
      {/* Incoming pending requests */}
      {requests.length > 0 && (
        <>
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{t("friends.pendingRequests")}</h3>
          {requests.map((r) => (
            <div key={r.friendship_id} className="glass-card-sm p-3 flex items-center gap-3">
              <Avatar name={r.requester.name} avatarUrl={r.requester.avatar_url} size="sm" userId={r.requester.user_id} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{r.requester.name}</p>
                {r.requester.username && <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{r.requester.username}</p>}
              </div>
              <button onClick={() => respondToRequest(r.friendship_id, "accept").then(() => { qc.invalidateQueries({ queryKey: ["friends"] }); qc.invalidateQueries({ queryKey: ["friendRequests"] }); })}
                className="px-3 py-1 rounded-lg text-white text-xs font-semibold" style={{ background: "var(--theme-accent)" }}>{t("friends.accept")}</button>
              <button onClick={() => respondToRequest(r.friendship_id, "decline").then(() => qc.invalidateQueries({ queryKey: ["friendRequests"] }))}
                className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>{t("friends.decline")}</button>
            </div>
          ))}
        </>
      )}

      {/* Sent requests */}
      {sentRequests.length > 0 && (
        <>
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{t("friends.sentRequests")}</h3>
          {sentRequests.map((r) => (
            <div key={r.friendship_id} className="glass-card-sm p-3 flex items-center gap-3">
              <Avatar name={r.addressee.name} avatarUrl={r.addressee.avatar_url} size="sm" userId={r.addressee.user_id} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{r.addressee.name}</p>
                {r.addressee.username && <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{r.addressee.username}</p>}
              </div>
              <button
                onClick={() => cancelMutation.mutate(r.friendship_id)}
                className="px-3 py-1 rounded-lg text-xs font-medium"
                style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}
              >
                {t("friends.cancel")}
              </button>
            </div>
          ))}
        </>
      )}

      {/* Friends list */}
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{t("profileTabs.friends")}</h3>
      {friends.map((f) => (
        <button key={f.user_id} className="glass-card-sm p-3 flex items-center gap-3 w-full text-start active:scale-[0.98] transition-transform" onClick={() => onFriendClick(f.user_id)}>
          <Avatar name={f.name} avatarUrl={f.avatar_url} size="sm" userId={f.user_id} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{f.name}</p>
            {f.username && <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{f.username}</p>}
          </div>
        </button>
      ))}
      {friends.length === 0 && <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>{t("profileTabs.addFriendEmpty")}</p>}
    </div>
  );
}
