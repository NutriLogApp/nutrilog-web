import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { getFriendProfile } from "@/services/socialService";
import Avatar from "@/components/shared/Avatar";

interface FriendProfileModalProps {
  userId: string | null;
  onClose: () => void;
}

export default function FriendProfileModal({ userId, onClose }: FriendProfileModalProps) {
  const { t } = useTranslation();
  const { data: profile } = useQuery({
    queryKey: ["friendProfile", userId],
    queryFn: () => getFriendProfile(userId!),
    enabled: !!userId,
  });

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} />
      <div
        className="relative w-full max-w-lg rounded-t-[20px] pb-24"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderBottom: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-9 h-1 rounded-full" style={{ background: "var(--text-muted)", opacity: 0.3 }} />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--bg-input)" }}
        >
          <X size={16} style={{ color: "var(--text-muted)" }} />
        </button>

        {!profile ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-accent)" }} />
          </div>
        ) : (
          <div className="px-5">
            {/* Avatar + name */}
            <div className="text-center mb-5">
              <div className="flex justify-center mb-3">
                <Avatar name={profile.name} avatarUrl={profile.avatar_url} size="lg" userId={profile.user_id} />
              </div>
              <p className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{profile.name}</p>
              {profile.username && (
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>@{profile.username}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <StatCard label={t("friends.joined")} value={profile.joined} />
              <StatCard label={t("friends.bestStreak")} value={`🔥 ${profile.longest_streak} ${profile.longest_streak === 1 ? "day" : "days"}`} />
              <StatCard label={t("friends.friendsSince")} value={profile.friends_since} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex-1 rounded-[14px] p-3.5 text-center"
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
      }}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}
