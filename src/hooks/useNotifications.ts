import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getFriendRequests, getFriendsLeaderboard } from "@/services/socialService";
import { getActiveAnnouncements } from "@/services/announcementService";

export type NotificationType =
  | "friend_request"
  | "announcement"
  | "streak"
  | "contest"
  | "insight";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  text: string;
  timestamp: number; // epoch ms for recency comparison
  data?: {
    friendshipId?: string;
    requesterName?: string;
    announcementBody?: string;
    contestLink?: string;
  };
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100] as const;
const LAST_VIEWED_KEY = "nutrilog_notification_last_viewed";
const SHOWN_MILESTONES_KEY = "nutrilog_shown_milestones";

function getLastViewed(): number {
  return parseInt(localStorage.getItem(LAST_VIEWED_KEY) ?? "0", 10);
}

function getShownMilestones(): number[] {
  try {
    return JSON.parse(localStorage.getItem(SHOWN_MILESTONES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useNotifications(streak: number) {
  const { t } = useTranslation();

  const friendRequestsQuery = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    staleTime: 60_000,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["friendsLeaderboard"],
    queryFn: getFriendsLeaderboard,
    staleTime: 60_000,
  });

  const announcementsQuery = useQuery({
    queryKey: ["announcements"],
    queryFn: getActiveAnnouncements,
    staleTime: 60_000,
  });

  const items = useMemo(() => {
    const result: NotificationItem[] = [];
    const now = Date.now();

    // 1. Friend requests (highest priority)
    if (friendRequestsQuery.data) {
      for (const req of friendRequestsQuery.data) {
        result.push({
          id: `fr-${req.friendship_id}`,
          type: "friend_request",
          text: t("notifications.friendRequest", { name: req.requester.name }),
          timestamp: new Date(req.created_at).getTime(),
          data: {
            friendshipId: req.friendship_id,
            requesterName: req.requester.name,
          },
        });
      }
    }

    // 2. System announcements
    if (announcementsQuery.data) {
      for (const ann of announcementsQuery.data) {
        result.push({
          id: `ann-${ann.id}`,
          type: "announcement",
          text: ann.title,
          timestamp: new Date(ann.created_at).getTime(),
          data: { announcementBody: ann.body ?? undefined },
        });
      }
    }

    // 3. Streak milestones
    const shownMilestones = getShownMilestones();
    for (const milestone of STREAK_MILESTONES) {
      if (streak >= milestone && !shownMilestones.includes(milestone)) {
        result.push({
          id: `streak-${milestone}`,
          type: "streak",
          text: t(`notifications.streak${milestone}`),
          timestamp: now,
        });
      }
    }

    // 4. Contest status
    const lb = leaderboardQuery.data;
    if (lb && lb.standings.length > 1) {
      const me = lb.standings.find((s) => s.is_current_user);
      if (me) {
        const text =
          me.rank === 1
            ? t("notifications.contestLeading", { points: me.total_points })
            : t("notifications.contestBehind", {
                rank: me.rank,
                gap: lb.standings[0].total_points - me.total_points,
                leader: lb.standings[0].name,
              });
        result.push({
          id: "contest-status",
          type: "contest",
          text,
          timestamp: now,
          data: { contestLink: "/contest" },
        });
      }
    }

    return result;
  }, [
    friendRequestsQuery.data,
    announcementsQuery.data,
    leaderboardQuery.data,
    streak,
    t,
  ]);

  const lastViewed = getLastViewed();
  const hasUnread = items.some((item) => item.timestamp > lastViewed);

  const markRead = useCallback(() => {
    localStorage.setItem(LAST_VIEWED_KEY, String(Date.now()));
    // Mark streak milestones as shown
    const shownMilestones = getShownMilestones();
    const newMilestones = items
      .filter((i) => i.type === "streak")
      .map((i) => parseInt(i.id.replace("streak-", ""), 10));
    if (newMilestones.length > 0) {
      localStorage.setItem(
        SHOWN_MILESTONES_KEY,
        JSON.stringify([...shownMilestones, ...newMilestones])
      );
    }
  }, [items]);

  return { items, hasUnread, markRead, lastViewed };
}
