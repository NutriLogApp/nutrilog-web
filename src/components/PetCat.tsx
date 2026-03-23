import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { refreshMessage } from "@/services/petService";
import { usePetStatus } from "@/hooks/usePetStatus";

const MOOD_EMOJI: Record<string, string> = {
  ecstatic: "😸",
  happy: "😺",
  meh: "😼",
  sad: "😿",
  hungry: "🙀",
};

const MOOD_BG: Record<string, string> = {
  ecstatic: "from-amber-100 to-yellow-50",
  happy: "from-emerald-100 to-green-50",
  meh: "from-slate-100 to-slate-50",
  sad: "from-blue-100 to-indigo-50",
  hungry: "from-orange-100 to-red-50",
};

const MOOD_ANIM: Record<string, string> = {
  ecstatic: "animate-pulse",
  happy: "animate-bounce",
  meh: "animate-[float_3s_ease-in-out_infinite]",
  sad: "animate-[droop_2s_ease-in-out_infinite]",
  hungry: "animate-[wiggle_0.5s_ease-in-out_infinite]",
};

export default function PetCat() {
  const { data: pet, invalidate } = usePetStatus();
  const [bubbleMsg, setBubbleMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const msgMut = useMutation({
    mutationFn: refreshMessage,
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      setBubbleMsg(data.message);
      setLoading(false);
      invalidate();
    },
    onError: () => setLoading(false),
  });

  if (!pet) return null;

  const mood = pet.mood;
  const emoji = MOOD_EMOJI[mood] ?? "😺";
  const bg = MOOD_BG[mood] ?? "from-slate-100 to-slate-50";
  const anim = MOOD_ANIM[mood] ?? "";
  const message = bubbleMsg ?? pet.message;

  return (
    <button
      onClick={() => msgMut.mutate()}
      className={`w-full flex items-center gap-3 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-r ${bg}`}
    >
      {/* Cat avatar */}
      <div className="relative shrink-0">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-inner"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
        >
          <span className={`text-2xl ${anim}`}>{emoji}</span>
        </div>
        {/* Streak badge */}
        {pet.current_streak > 0 && (
          <span className="absolute -top-1 -end-1 bg-amber-400 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {pet.current_streak}
          </span>
        )}
      </div>

      {/* Speech bubble */}
      <div className="flex-1 text-start">
        <div
          className="text-sm text-slate-700 leading-relaxed"
          style={pet.message_type === "ai" ? { borderInlineStart: "3px solid var(--theme-start)", paddingInlineStart: "8px" } : {}}
        >
          {loading ? (
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          ) : (
            message
          )}
        </div>
      </div>
    </button>
  );
}
