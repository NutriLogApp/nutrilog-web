import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Crown } from "lucide-react";
import { getLeaderboard } from "@/services/socialService";

export default function GroupLeaderboardPage() {
  const { t } = useTranslation();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", groupId],
    queryFn: () => getLeaderboard(groupId!),
    enabled: !!groupId,
  });

  return (
    <div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      <button onClick={() => navigate("/friends")} className="mb-0" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /></button>
      <div className="animate-fade-up">
        <h1 className="text-xl font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>{t("groups.leaderboard")}</h1>
        {data && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("groups.weekOf")} {data.week_start}</p>}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-accent)" }} />
        </div>
      )}

      <div className="space-y-2 animate-fade-up">
        {data?.standings.map((s) => (
          <div key={s.user_id} className={`glass-card p-4 flex items-center gap-3 active:scale-[0.98] transition-transform ${s.is_current_user ? "ring-2 ring-[var(--theme-accent)]" : ""}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 style={s.rank === 1 ? { background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))", color: "white" } : { background: "#f1f5f9" }}>
              {s.rank === 1 ? <Crown size={14} /> : s.rank}
            </div>
            <div className="flex-1">
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{s.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.days_logged}/{s.days_in_week} {t("groups.days")}</p>
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--theme-accent)" }}>{s.total_points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
