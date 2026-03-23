import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCollection, setActiveCat, type CatInfo } from "@/services/petService";
import { Lock } from "lucide-react";

export default function CatCollection() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["petCollection"],
    queryFn: getCollection,
  });

  const selectMut = useMutation({
    mutationFn: setActiveCat,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["petCollection"] });
      qc.invalidateQueries({ queryKey: ["petStatus"] });
    },
  });

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <h2 className="font-semibold text-slate-700 mb-3">Cat Collection</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {data.cats.map((cat: CatInfo) => {
          const active = data.active_cat === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => cat.unlocked && selectMut.mutate(cat.name)}
              disabled={!cat.unlocked}
              className={`flex flex-col items-center gap-1 min-w-16 p-2 rounded-lg border-2 transition-colors ${
                active
                  ? "border-[var(--theme-start)] bg-slate-50"
                  : cat.unlocked
                    ? "border-transparent hover:border-slate-200"
                    : "border-transparent opacity-40"
              }`}
            >
              <span className="text-2xl relative">
                {cat.emoji}
                {!cat.unlocked && (
                  <Lock size={12} className="absolute -bottom-1 -right-1 text-slate-400" />
                )}
              </span>
              <span className="text-[10px] text-slate-500 capitalize">{cat.name}</span>
              {!cat.unlocked && (
                <span className="text-[9px] text-slate-400">{cat.unlock_streak}d streak</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
