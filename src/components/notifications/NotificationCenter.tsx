import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { NotificationItemRow } from "./NotificationItem";
import type { NotificationItem } from "@/hooks/useNotifications";

interface Props {
  open: boolean;
  items: NotificationItem[];
  lastViewed: number;
  onClose: () => void;
  onApproveFriend: (friendshipId: string, name: string) => void;
}

export function NotificationCenter({
  open,
  items,
  lastViewed,
  onClose,
  onApproveFriend,
}: Props) {
  const { t } = useTranslation();
  const [approvedFriends, setApprovedFriends] = useState<Set<string>>(
    new Set()
  );

  if (!open) return null;

  const handleApproveFriend = (friendshipId: string, name: string) => {
    setApprovedFriends((prev) => new Set(prev).add(friendshipId));
    onApproveFriend(friendshipId, name);
  };

  return (
    <>
      <div
        data-testid="notification-backdrop"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 50,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          maxHeight: "60vh",
          zIndex: 51,
          borderRadius: "0 0 20px 20px",
          background: "var(--bg-card-solid)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          overflow: "auto",
          animation: "slideDown 0.25s ease-out",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {t("notifications.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-all active:scale-[0.9]"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <X size={16} color="var(--text-muted)" />
          </button>
        </div>
        <div className="px-2 pb-4">
          {items.length === 0 ? (
            <p
              className="text-center py-8"
              style={{ fontSize: 13, color: "var(--text-muted)" }}
            >
              {t("notifications.empty")}
            </p>
          ) : (
            items.map((item) => (
              <NotificationItemRow
                key={item.id}
                item={item}
                isUnread={item.timestamp > lastViewed}
                onApproveFriend={handleApproveFriend}
                approvedFriends={approvedFriends}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
