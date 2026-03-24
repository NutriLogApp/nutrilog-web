export type ThemeName =
  | "ocean" | "forest" | "midnight" | "ember"
  | "gold" | "iris" | "obsidian" | "rose" | "arctic";

export const themes: Record<ThemeName, { start: string; end: string; accent: string }> = {
  ocean:    { start: "#0d9488", end: "#0891b2", accent: "#0d9488" },
  forest:   { start: "#059669", end: "#10b981", accent: "#10b981" },
  midnight: { start: "#1d4ed8", end: "#6366f1", accent: "#6366f1" },
  ember:    { start: "#e11d48", end: "#f43f5e", accent: "#f43f5e" },
  gold:     { start: "#b45309", end: "#f59e0b", accent: "#f59e0b" },
  iris:     { start: "#6d28d9", end: "#a78bfa", accent: "#a78bfa" },
  obsidian: { start: "#334155", end: "#64748b", accent: "#94a3b8" },
  rose:     { start: "#be185d", end: "#ec4899", accent: "#ec4899" },
  arctic:   { start: "#0369a1", end: "#38bdf8", accent: "#38bdf8" },
};

export function applyTheme(name: ThemeName) {
  const t = themes[name];
  document.documentElement.style.setProperty("--theme-start", t.start);
  document.documentElement.style.setProperty("--theme-end", t.end);
  document.documentElement.style.setProperty("--theme-accent", t.accent);
}
