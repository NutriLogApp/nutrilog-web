import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import type { NotificationItem } from "@/hooks/useNotifications";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "notifications.title": "Notifications",
        "notifications.empty": "You're all caught up!",
        "notifications.friendAccepted":
          "You and Test are now friends! Check the contest to see who logs more",
      };
      return map[key] ?? key;
    },
  }),
}));

const mockItems: NotificationItem[] = [
  {
    id: "fr-123",
    type: "friend_request",
    text: "Alice wants to be your friend",
    timestamp: Date.now(),
    data: { friendshipId: "123", requesterName: "Alice" },
  },
  {
    id: "ann-456",
    type: "announcement",
    text: "Maintenance tonight",
    timestamp: Date.now() - 1000,
    data: { announcementBody: "Down at 11pm for updates" },
  },
  {
    id: "streak-7",
    type: "streak",
    text: "7-day streak! Keep it going!",
    timestamp: Date.now() - 2000,
  },
  {
    id: "contest-status",
    type: "contest",
    text: "You're #2 this week — 3 pts behind Bob",
    timestamp: Date.now() - 3000,
    data: { contestLink: "/contest" },
  },
];

describe("NotificationCenter", () => {
  it("renders all notification items", () => {
    render(
      <NotificationCenter
        open={true}
        items={mockItems}
        lastViewed={0}
        onClose={vi.fn()}
        onApproveFriend={vi.fn()}
      />
    );
    expect(
      screen.getByText("Alice wants to be your friend")
    ).toBeInTheDocument();
    expect(screen.getByText("Maintenance tonight")).toBeInTheDocument();
    expect(
      screen.getByText("7-day streak! Keep it going!")
    ).toBeInTheDocument();
    expect(screen.getByText(/You're #2 this week/)).toBeInTheDocument();
  });

  it("shows empty state when no items", () => {
    render(
      <NotificationCenter
        open={true}
        items={[]}
        lastViewed={0}
        onClose={vi.fn()}
        onApproveFriend={vi.fn()}
      />
    );
    expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
  });

  it("returns null when not open", () => {
    const { container } = render(
      <NotificationCenter
        open={false}
        items={mockItems}
        lastViewed={0}
        onClose={vi.fn()}
        onApproveFriend={vi.fn()}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    render(
      <NotificationCenter
        open={true}
        items={mockItems}
        lastViewed={0}
        onClose={onClose}
        onApproveFriend={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId("notification-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onApproveFriend when checkmark is clicked on friend request", async () => {
    const onApproveFriend = vi.fn();
    render(
      <NotificationCenter
        open={true}
        items={mockItems}
        lastViewed={0}
        onClose={vi.fn()}
        onApproveFriend={onApproveFriend}
      />
    );
    await userEvent.click(screen.getByTestId("approve-fr-123"));
    expect(onApproveFriend).toHaveBeenCalledWith("123", "Alice");
  });

  it("shows unread tint for items newer than lastViewed", () => {
    const oldTimestamp = Date.now() - 100_000;
    render(
      <NotificationCenter
        open={true}
        items={mockItems}
        lastViewed={oldTimestamp}
        onClose={vi.fn()}
        onApproveFriend={vi.fn()}
      />
    );
    const unreadItems = screen.getAllByTestId("notification-row-unread");
    expect(unreadItems.length).toBeGreaterThan(0);
  });

  it("expands announcement body when clicked", async () => {
    render(
      <NotificationCenter
        open={true}
        items={mockItems}
        lastViewed={0}
        onClose={vi.fn()}
        onApproveFriend={vi.fn()}
      />
    );
    await userEvent.click(screen.getByText("Maintenance tonight"));
    expect(
      screen.getByText("Down at 11pm for updates")
    ).toBeInTheDocument();
  });
});
