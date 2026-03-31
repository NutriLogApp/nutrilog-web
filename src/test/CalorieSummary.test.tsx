import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalorieSummary } from "@/components/home/CalorieSummary";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        "calorieSummary.remaining": "calories remaining",
        "calorieSummary.details": "details",
        "home.streak": `${opts?.count}-day streak`,
        "macros.protein": "Protein",
        "macros.fat": "Fat",
        "macros.carbs": "Carbs",
        "macros.proteinShort": "P",
        "macros.fatShort": "F",
        "macros.carbsShort": "C",
        "water.label": "Water",
        "log.g": "g",
      };
      return map[key] ?? key;
    },
  }),
}));

const defaultProps = {
  caloriesConsumed: 1247,
  caloriesGoal: 2000,
  proteinConsumed: 85,
  proteinGoal: 120,
  fatConsumed: 45,
  fatGoal: 65,
  carbsConsumed: 180,
  carbsGoal: 250,
  waterMl: 1200,
  waterGoalMl: 2000,
  streak: 12,
  onBellClick: vi.fn(),
  hasUnread: false,
};

describe("CalorieSummary", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows remaining calories (goal - consumed)", () => {
    render(<CalorieSummary {...defaultProps} />);
    expect(screen.getByText("753")).toBeInTheDocument();
  });

  it("shows 'calories remaining' subtitle", () => {
    render(<CalorieSummary {...defaultProps} />);
    expect(screen.getByText("calories remaining")).toBeInTheDocument();
  });

  it("shows streak pill", () => {
    render(<CalorieSummary {...defaultProps} />);
    expect(screen.getByText("12-day streak")).toBeInTheDocument();
  });

  it("shows macro summary in collapsed state", () => {
    render(<CalorieSummary {...defaultProps} />);
    expect(screen.getByText(/P 85g/)).toBeInTheDocument();
    expect(screen.getByText(/F 45g/)).toBeInTheDocument();
    expect(screen.getByText(/C 180g/)).toBeInTheDocument();
  });

  it("shows water in collapsed state", () => {
    render(<CalorieSummary {...defaultProps} />);
    expect(screen.getByText(/1\.2\/2\.0/)).toBeInTheDocument();
  });

  it("shows details affordance in collapsed state", () => {
    render(<CalorieSummary {...defaultProps} />);
    expect(screen.getByText(/details/)).toBeInTheDocument();
  });

  it("expands to show progress bars when details is clicked", async () => {
    render(<CalorieSummary {...defaultProps} />);
    await userEvent.click(screen.getByText(/details/));
    expect(screen.getByText("Protein")).toBeInTheDocument();
    expect(screen.getByText("85/120g")).toBeInTheDocument();
  });

  it("collapses back when collapse is clicked", async () => {
    render(<CalorieSummary {...defaultProps} />);
    await userEvent.click(screen.getByText(/details/));
    expect(screen.getByText("Protein")).toBeInTheDocument();
    await userEvent.click(screen.getByText(/details/));
    expect(screen.queryByText("85/120g")).not.toBeInTheDocument();
  });

  it("persists expanded state to localStorage", async () => {
    render(<CalorieSummary {...defaultProps} />);
    await userEvent.click(screen.getByText(/details/));
    expect(localStorage.getItem("mealriot_hero_expanded")).toBe("true");
  });

  it("shows 0 when consumed exceeds goal", () => {
    render(<CalorieSummary {...defaultProps} caloriesConsumed={2500} caloriesGoal={2000} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("calls onBellClick when bell is clicked", async () => {
    const onBellClick = vi.fn();
    render(<CalorieSummary {...defaultProps} onBellClick={onBellClick} />);
    await userEvent.click(screen.getByTestId("bell-button"));
    expect(onBellClick).toHaveBeenCalledOnce();
  });

  it("shows red dot badge when hasUnread is true", () => {
    render(<CalorieSummary {...defaultProps} hasUnread={true} />);
    expect(screen.getByTestId("unread-badge")).toBeInTheDocument();
  });
});
