import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { listGroups, getLeaderboard } from "@/services/socialService";

export default function CompetitionWidget() {
  const navigate = useNavigate();
  const { data: groups } = useQuery({ queryKey: ["groups"], queryFn: listGroups });

  const firstGroup = groups?.[0];
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", firstGroup?.group_id],
    queryFn: () => getLeaderboard(firstGroup!.group_id),
    enabled: !!firstGroup,
  });

  if (!firstGroup || !leaderboard) return null;

  const me = leaderboard.standings.find((s) => s.is_current_user);
  if (!me) return null;

  return (
    <button
      onClick={() => navigate("/friends")}
      className="w-full bg-white rounded-xl p-3 shadow-sm mb-4 flex items-center gap-3"
    >
      <Trophy size={18} className="text-amber-500" />
      <div className="flex-1 text-left">
        <p className="font-medium text-sm text-slate-900">{firstGroup.name}</p>
        <p className="text-xs text-slate-400">#{me.rank} · {me.total_points} pts</p>
      </div>
    </button>
  );
}
