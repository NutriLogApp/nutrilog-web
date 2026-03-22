import { describe, it, expect, beforeEach } from "vitest";
import { applyTheme, themes } from "@/themes/themes";

describe("applyTheme", () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty("--theme-start");
    document.documentElement.style.removeProperty("--theme-end");
  });

  it("applies ocean theme CSS variables", () => {
    applyTheme("ocean");
    expect(document.documentElement.style.getPropertyValue("--theme-start")).toBe("#0d9488");
    expect(document.documentElement.style.getPropertyValue("--theme-end")).toBe("#0891b2");
  });

  it("applies all 9 themes without error", () => {
    Object.keys(themes).forEach((name) => {
      expect(() => applyTheme(name as any)).not.toThrow();
    });
  });

  it("has 9 named themes", () => {
    expect(Object.keys(themes)).toHaveLength(9);
  });
});
