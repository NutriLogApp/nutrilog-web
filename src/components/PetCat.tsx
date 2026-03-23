import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { refreshMessage } from "@/services/petService";
import { usePetStatus } from "@/hooks/usePetStatus";
import RiveCat from "./RiveCat";

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
  const message = bubbleMsg ?? pet.message;

  return (
    <button
      onClick={() => msgMut.mutate()}
      className="w-full flex items-center gap-3 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className="relative shrink-0">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-inner"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
        >
          <RiveCat mood={mood} />
        </div>
        {pet.current_streak > 0 && (
          <span className="absolute -top-1 -end-1 bg-amber-400 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {pet.current_streak}
          </span>
        )}
      </div>
      <div className="flex-1 text-start">
        <div
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)", ...(pet.message_type === "ai" ? { borderInlineStart: "3px solid var(--theme-start)", paddingInlineStart: "8px" } : {}) }}
        >
          {loading ? (
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-muted)", animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-muted)", animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-muted)", animationDelay: "300ms" }} />
            </span>
          ) : (
            message
          )}
        </div>
      </div>
    </button>
  );
}
