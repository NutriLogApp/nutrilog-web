import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getCollection, setActiveCat, type CatInfo } from "@/services/petService";
import { Lock } from "lucide-react";

export default function CatCollection() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["petCollection"], queryFn: getCollection });

  const selectMut = useMutation({
    mutationFn: setActiveCat,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["petCollection"] });
      qc.invalidateQueries({ queryKey: ["petStatus"] });
    },
  });

  if (!data) return null;

  return (
    <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "var(--bg-card)" }}>
      <h2 className="font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>{t("profile.catCollection")}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {data.cats.map((cat: CatInfo) => {
          const active = data.active_cat === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => cat.unlocked && selectMut.mutate(cat.name)}
              disabled={!cat.unlocked}
              className={`flex flex-col items-center gap-1 min-w-16 p-2 rounded-lg border-2 transition-colors ${
                active ? "border-[var(--theme-start)]"
                  : cat.unlocked ? "border-transparent"
                  : "border-transparent opacity-40"
              }`}
              style={active ? { backgroundColor: "var(--bg-page)" } : undefined}
            >
              <span className="text-2xl relative">
                {cat.emoji}
                {!cat.unlocked && <Lock size={12} className="absolute -bottom-1 -end-1" style={{ color: "var(--text-muted)" }} />}
              </span>
              <span className="text-[10px] capitalize" style={{ color: "var(--text-muted)" }}>{cat.name}</span>
              {!cat.unlocked && (
                <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{cat.unlock_streak} {t("profile.streakDays")}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
