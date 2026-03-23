import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trophy } from "lucide-react";
import { listGroups, getLeaderboard } from "@/services/socialService";

export default function CompetitionWidget() {
  const { t } = useTranslation();
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
    <button onClick={() => navigate("/friends")} className="w-full glass-card-sm p-4 flex items-center gap-3 transition-all active:scale-[0.98]">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(245, 158, 11, 0.12)" }}>
        <Trophy size={18} color="#f59e0b" />
      </div>
      <div className="flex-1 text-start">
        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{firstGroup.name}</p>
        <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>#{me.rank} · {me.total_points} {t("groups.pts")}</p>
      </div>
    </button>
  );
}
