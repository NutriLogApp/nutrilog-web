import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Flame,
  Lightbulb,
  Megaphone,
  Trophy,
  UserPlus,
} from "lucide-react";
import type { NotificationItem as NotifType } from "@/hooks/useNotifications";

const ICON_MAP = {
  friend_request: {
    icon: UserPlus,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
  },
  announcement: {
    icon: Megaphone,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  streak: { icon: Flame, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  contest: { icon: Trophy, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  insight: {
    icon: Lightbulb,
    color: "#0d9488",
    bg: "rgba(13,148,136,0.1)",
  },
} as const;

interface Props {
  item: NotifType;
  isUnread: boolean;
  onApproveFriend: (friendshipId: string, name: string) => void;
  approvedFriends: Set<string>;
}

export function NotificationItemRow({
  item,
  isUnread,
  onApproveFriend,
  approvedFriends,
}: Props) {
  const navigate = useNavigate();
  const [expandedBody, setExpandedBody] = useState(false);
  const { icon: Icon, color, bg } = ICON_MAP[item.type];
  const isApproved = item.data?.friendshipId
    ? approvedFriends.has(item.data.friendshipId)
    : false;

  const handleClick = () => {
    if (item.type === "announcement" && item.data?.announcementBody) {
      setExpandedBody(!expandedBody);
    } else if (item.type === "contest" && item.data?.contestLink) {
      navigate(item.data.contestLink);
    }
  };

  return (
    <div
      data-testid={isUnread ? "notification-row-unread" : "notification-row"}
      onClick={handleClick}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        background: isUnread
          ? "color-mix(in srgb, var(--theme-accent) 6%, transparent)"
          : "transparent",
        cursor:
          item.type === "announcement" || item.type === "contest"
            ? "pointer"
            : "default",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: bg }}
        >
          <Icon size={15} color={color} />
        </div>
        <div className="flex-1 min-w-0">
          {isApproved ? (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                lineHeight: 1.4,
              }}
            >
              You and <strong>{item.data?.requesterName}</strong> are now
              friends!{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/contest");
                }}
                style={{ color: "var(--theme-accent)", cursor: "pointer" }}
              >
                Check the contest
              </span>{" "}
              to see who logs more
            </p>
          ) : (
            <p
              style={{
                fontSize: 12,
                color: "var(--text-primary)",
                lineHeight: 1.4,
              }}
            >
              {item.text}
            </p>
          )}
        </div>
        {item.type === "friend_request" && !isApproved && (
          <button
            data-testid={`approve-${item.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (item.data?.friendshipId && item.data?.requesterName) {
                onApproveFriend(item.data.friendshipId, item.data.requesterName);
              }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-[0.9]"
            style={{ background: "rgba(16,185,129,0.12)" }}
          >
            <Check size={16} color="#10b981" />
          </button>
        )}
      </div>
      {expandedBody && item.data?.announcementBody && (
        <p
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 6,
            marginLeft: 44,
            lineHeight: 1.5,
          }}
        >
          {item.data.announcementBody}
        </p>
      )}
    </div>
  );
}
