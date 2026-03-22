export type ThemeName =
  | "ocean" | "forest" | "midnight" | "ember"
  | "gold" | "iris" | "obsidian" | "rose" | "arctic";

export const themes: Record<ThemeName, { start: string; end: string; label: string }> = {
  ocean:    { start: "#0d9488", end: "#0891b2", label: "Ocean" },
  forest:   { start: "#059669", end: "#10b981", label: "Forest" },
  midnight: { start: "#1d4ed8", end: "#6366f1", label: "Midnight" },
  ember:    { start: "#e11d48", end: "#f43f5e", label: "Ember" },
  gold:     { start: "#b45309", end: "#f59e0b", label: "Gold" },
  iris:     { start: "#6d28d9", end: "#a78bfa", label: "Iris" },
  obsidian: { start: "#0f172a", end: "#334155", label: "Obsidian" },
  rose:     { start: "#be185d", end: "#ec4899", label: "Rose" },
  arctic:   { start: "#0369a1", end: "#38bdf8", label: "Arctic" },
};

export function applyTheme(name: ThemeName) {
  const t = themes[name];
  document.documentElement.style.setProperty("--theme-start", t.start);
  document.documentElement.style.setProperty("--theme-end", t.end);
}
