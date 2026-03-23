import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LogFoodPage from "@/pages/LogFoodPage";

vi.mock("@/services/foodService", () => ({
  parseText: vi.fn().mockResolvedValue([
    {
      food_name: "Bread",
      food_name_he: "לחם",
      grams: 30,
      calories: 79,
      protein_g: 2.5,
      fat_g: 0.8,
      carbs_g: 15.1,
      confidence: "high",
    },
  ]),
  parseImage: vi.fn(),
  lookupBarcode: vi.fn(),
}));

vi.mock("@/services/entriesService", () => ({
  createEntry: vi.fn().mockResolvedValue({ id: "1" }),
}));

vi.mock("@/services/recentFoodsService", () => ({
  getRecentFoods: vi.fn().mockResolvedValue([]),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "log.title": "Log Food",
        "log.text": "Text",
        "log.photo": "Photo",
        "log.barcode": "Barcode",
        "log.save": "Save to Log",
        "log.recent": "Recent",
        "log.aiResult": "AI Result",
        "log.analyze": "Analyze",
        "log.lookup": "Look up",
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

describe("LogFoodPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders tabs and text input", () => {
    render(<LogFoodPage />, { wrapper: Wrapper });
    expect(screen.getByText("Log Food")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Barcode")).toBeInTheDocument();
  });

  it("parses text and shows AI result", async () => {
    render(<LogFoodPage />, { wrapper: Wrapper });
    const textarea = screen.getByPlaceholderText(/eggs/);
    fireEvent.change(textarea, { target: { value: "bread" } });
    fireEvent.click(screen.getByText("Analyze"));
    await waitFor(() => {
      expect(screen.getByText("Bread")).toBeInTheDocument();
    });
    expect(screen.getByText("79 kcal")).toBeInTheDocument();
    expect(screen.getByText("Save to Log")).toBeInTheDocument();
  });
});
