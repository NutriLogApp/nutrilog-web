const DOT_COLORS: Record<string, string> = {
  positive: "#22c55e",
  warning: "#f59e0b",
  motivational: "#f59e0b",
  suggestion: "var(--theme-accent)",
};

interface InsightLineProps {
  text: string;
  category?: "positive" | "warning" | "suggestion" | "motivational";
}

export function InsightLine({ text, category = "suggestion" }: InsightLineProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5">
      <div
        className="w-[5px] h-[5px] rounded-full flex-shrink-0"
        style={{ background: DOT_COLORS[category] ?? DOT_COLORS.suggestion }}
      />
      <span className="text-[11px] leading-tight" style={{ color: "var(--text-secondary)" }}>
        {text}
      </span>
    </div>
  );
}
