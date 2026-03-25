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
    entries: [],
  }),
}));

vi.mock("@/services/profileService", () => ({
  getProfile: vi.fn().mockResolvedValue({ name: "Test User", onboarding_done: true, current_streak: 0 }),
}));

vi.mock("@/services/waterService", () => ({
  getTodayWater: vi.fn().mockResolvedValue({ date: "2026-03-23", amount_ml: 500, goal_ml: 2000 }),
  addWater: vi.fn().mockResolvedValue({ date: "2026-03-23", amount_ml: 750, goal_ml: 2000 }),
}));

vi.mock("@/services/entriesService", () => ({
  deleteEntry: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/insightService", () => ({
  getDailyInsight: vi.fn().mockResolvedValue({ summary: "", suggestion: "Test tip", source: "static" }),
  refreshInsight: vi.fn().mockResolvedValue({ summary: "", suggestion: "Test tip", source: "static" }),
}));

vi.mock("@/services/drinksService", () => ({
  listDrinks: vi.fn().mockResolvedValue([]),
  logDrink: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/socialService", () => ({
  listGroups: vi.fn().mockResolvedValue([]),
  getLeaderboard: vi.fn(),
  getFriendRequests: vi.fn().mockResolvedValue([]),
}));

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "3rdParty", init: () => {} },
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const map: Record<string, string> = {
        "dashboard.goodMorning": "Good morning",
        "dashboard.goodAfternoon": "Good afternoon",
        "dashboard.goodEvening": "Good evening",
        "dashboard.kcalToday": "kcal today",
        "dashboard.dayStreak": "day streak",
        "macros.protein": "Protein",
        "macros.fat": "Fat",
        "macros.carbs": "Carbs",
        "myday.addFood": "Add Food",
        "myday.addDrink": "Add Drink",
        "log.title": "Log Food",
      };
      if (key === "dashboard.ofXKcal" && params?.x) return `of ${params.x} kcal`;
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

  it("renders calorie ring and greeting", async () => {
    render(<DashboardPage />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByText("850")).toBeInTheDocument();
    });
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
