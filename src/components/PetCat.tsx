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
  const anim = MOOD_ANIM[mood] ?? "";
  const message = bubbleMsg ?? pet.message;

  return (
    <div className="fixed bottom-20 right-4 flex items-end gap-2 z-40">
      {/* Speech bubble */}
      <button
        onClick={() => msgMut.mutate()}
        className="max-w-48 bg-white rounded-xl rounded-br-none px-3 py-2 shadow-md text-xs text-slate-700 leading-relaxed cursor-pointer hover:bg-slate-50 transition-colors"
        style={pet.message_type === "ai" ? { borderLeft: "3px solid var(--theme-start)" } : {}}
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
      </button>

      {/* Cat */}
      <button
        onClick={() => msgMut.mutate()}
        className={`text-4xl cursor-pointer ${anim}`}
      >
        {emoji}
      </button>
    </div>
  );
}
