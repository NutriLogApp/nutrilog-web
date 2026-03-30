import { describe, it, expect } from "vitest";
import i18n from "@/i18n";

describe("i18n", () => {
  it("has English translations", () => {
    i18n.changeLanguage("en");
    expect(i18n.t("login.title")).toBe("MealRiot");
    expect(i18n.t("macros.protein")).toBe("Protein");
  });

  it("has Hebrew translations", () => {
    i18n.changeLanguage("he");
    expect(i18n.t("login.title")).toBe("MealRiot");
    expect(i18n.t("macros.protein")).toBe("חלבון");
  });

  it("falls back to English for unknown language", () => {
    i18n.changeLanguage("fr");
    expect(i18n.t("login.signIn")).toBe("Sign In");
  });
});
