import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Sparkles, RefreshCw } from "lucide-react";
import { getDailyInsight } from "@/services/insightService";

export default function DailyInsight() {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["insight"],
    queryFn: getDailyInsight,
    staleTime: 10 * 60 * 1000, // 10 min
  });

  return (
    <div className="glass-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
          <Sparkles size={16} color="white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {t("insight.title")}
            </span>
            <button onClick={() => refetch()} disabled={isLoading}
              className="p-1 rounded-full transition-all active:scale-90"
              style={{ color: "var(--text-muted)" }}>
              <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
          {isLoading ? (
            <div className="flex gap-1.5 py-2">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-muted)", animationDelay: `${d}ms` }} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {data?.suggestion}
            </p>
          )}
          {data?.source === "ai" && (
            <span className="inline-block mt-2 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "color-mix(in srgb, var(--theme-start) 12%, transparent)", color: "var(--theme-accent)" }}>
              AI
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
