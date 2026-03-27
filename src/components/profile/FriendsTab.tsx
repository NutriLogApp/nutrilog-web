import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Users, Share2, User, Copy } from "lucide-react";
import { listFriends, getFriendRequests, respondToRequest } from "@/services/socialService";
import { getProfile } from "@/services/profileService";
import Modal from "@/components/Modal";
import AddFriendModal from "@/components/shared/AddFriendModal";

export default function FriendsTab() {
  const { t } = useTranslation();
  const { data: friends = [] } = useQuery({ queryKey: ["friends"], queryFn: listFriends });
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const [modal, setModal] = useState<"add" | "share" | "all" | null>(null);

  const top4 = friends.slice(0, 4);

  return (
    <div className="space-y-3">
      {/* Top friends row */}
      <div className="flex justify-center gap-4 py-2">
        {top4.map((f) => (
          <div key={f.user_id} className="text-center">
            {f.avatar_url ? (
              <img src={f.avatar_url} alt="" className="w-12 h-12 rounded-full mx-auto" />
            ) : (
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "var(--bg-input)" }}>
                <User size={20} style={{ color: "var(--text-muted)" }} />
              </div>
            )}
            <div className="text-[11px] font-medium mt-1.5 max-w-[56px] truncate text-center" style={{ color: "var(--text-secondary)" }}>{f.name}</div>
          </div>
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

      {/* Share Invite Modal */}
      <Modal open={modal === "share"} onClose={() => setModal(null)} title={t("profile.shareInvite")}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("profile.shareDesc")}</p>
          {profile?.friend_code && (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl px-4 py-3 text-sm font-mono tabular-nums" style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>{profile.friend_code}</div>
              <button onClick={() => navigator.clipboard.writeText(profile.friend_code ?? "")}
                className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90" style={{ backgroundColor: "var(--bg-input)", color: "var(--theme-accent)" }}><Copy size={16} /></button>
            </div>
          )}
          <button onClick={() => {
            const url = `${window.location.origin}/friends/add?code=${profile?.friend_code}`;
            if (navigator.share) navigator.share({ title: "NutriLog", text: t("profile.shareText"), url });
            else navigator.clipboard.writeText(url);
          }} className="w-full py-3 rounded-xl text-white font-semibold active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>{t("profile.shareLink")}</button>
        </div>
      </Modal>

      {/* All Friends Modal — lists all friends with pending requests at top */}
      <Modal open={modal === "all"} onClose={() => setModal(null)} title={t("profileTabs.seeAllFriends")}>
        <AllFriendsList />
      </Modal>
    </div>
  );
}

function AllFriendsList() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data: friends = [] } = useQuery({ queryKey: ["friends"], queryFn: listFriends });
  const { data: requests = [] } = useQuery({ queryKey: ["friendRequests"], queryFn: getFriendRequests });

  return (
    <div className="space-y-3">
      {requests.length > 0 && (
        <>
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{t("friends.pendingRequests")}</h3>
          {requests.map((r) => (
            <div key={r.friendship_id} className="glass-card-sm p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "var(--bg-input)" }} />
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
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{t("profileTabs.friends")}</h3>
      {friends.map((f) => (
        <div key={f.user_id} className="glass-card-sm p-3 flex items-center gap-3">
          {f.avatar_url ? (
            <img src={f.avatar_url} alt="" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-input)" }}>
              <User size={16} style={{ color: "var(--text-muted)" }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{f.name}</p>
            {f.username && <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{f.username}</p>}
          </div>
        </div>
      ))}
      {friends.length === 0 && <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>{t("profileTabs.addFriendEmpty")}</p>}
    </div>
  );
}
