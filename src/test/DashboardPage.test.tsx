import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DashboardPage from "@/pages/DashboardPage";

vi.mock("@/services/statsService", () => ({
  getDailyStats: vi.fn().mockResolvedValue({
    date: "2026-03-23",
    total_calories: 850,
    total_protein_g: 45,
    total_fat_g: 30,
    total_carbs_g: 100,
    goal_calories: 2000,
    goal_protein_g: 120,
    goal_fat_g: 78,
    goal_carbs_g: 180,
    entries: [
      {
        id: "1",
        description: "2 eggs, toast",
        source: "text",
        image_url: null,
        meal_type: "breakfast",
        items: [],
        total_calories: 350,
        total_protein_g: 20,
        total_fat_g: 15,
        total_carbs_g: 30,
        logged_at: "2026-03-23T08:00:00Z",
      },
    ],
  }),
}));

vi.mock("@/services/profileService", () => ({
  getProfile: vi.fn().mockResolvedValue({ name: "Test User" }),
}));

vi.mock("@/services/entriesService", () => ({
  deleteEntry: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/insightService", () => ({
  getDailyInsight: vi.fn().mockResolvedValue({ summary: "", suggestion: "Test tip", source: "static" }),
}));

vi.mock("@/services/socialService", () => ({
  listGroups: vi.fn().mockResolvedValue([]),
  getLeaderboard: vi.fn(),
  getFriendRequests: vi.fn().mockResolvedValue([]),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "dashboard.goodMorning": "Good morning",
        "dashboard.goodAfternoon": "Good afternoon",
        "dashboard.goodEvening": "Good evening",
        "dashboard.goal": "Goal",
        "dashboard.kcalToday": "kcal today",
        "dashboard.onTrack": "on track",
        "dashboard.offTrack": "off track",
        "dashboard.left": "left",
        "dashboard.max": "max",
        "dashboard.todayLog": "Today's Log",
        "dashboard.noEntries": "No entries yet",
        "macros.protein": "Protein",
        "macros.fat": "Fat",
        "macros.carbs": "Carbs",
        "log.title": "Log Food",
      };
      return map[key] ?? key;
    },
  }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("DashboardPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders calorie count and entries", async () => {
    render(<DashboardPage />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByText("850")).toBeInTheDocument();
    });
    expect(screen.getByText("Today's Log")).toBeInTheDocument();
    expect(screen.getByText(/2 eggs, toast/)).toBeInTheDocument();
  });

  it("renders macro cards", async () => {
    render(<DashboardPage />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByText("Protein")).toBeInTheDocument();
    });
    expect(screen.getByText("Fat")).toBeInTheDocument();
    expect(screen.getByText("Carbs")).toBeInTheDocument();
  });
});
