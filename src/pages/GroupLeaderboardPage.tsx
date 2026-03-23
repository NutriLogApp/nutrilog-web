import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Crown } from "lucide-react";
import { getLeaderboard } from "@/services/socialService";

export default function GroupLeaderboardPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", groupId],
    queryFn: () => getLeaderboard(groupId!),
    enabled: !!groupId,
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={() => navigate("/friends")} className="mb-4 text-slate-500">
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Leaderboard</h1>
      {data && (
        <p className="text-xs text-slate-400 mb-4">Week of {data.week_start}</p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-transparent animate-spin"
               style={{ borderTopColor: "var(--theme-start)" }} />
        </div>
      )}

      <div className="space-y-2">
        {data?.standings.map((s) => (
          <div
            key={s.user_id}
            className={`bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 ${
              s.is_current_user ? "ring-2 ring-[var(--theme-start)]" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                 style={s.rank === 1 ? { background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))", color: "white" } : { background: "#f1f5f9" }}>
              {s.rank === 1 ? <Crown size={14} /> : s.rank}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-400">{s.days_logged}/{s.days_in_week} days</p>
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--theme-start)" }}>
              {s.total_points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
