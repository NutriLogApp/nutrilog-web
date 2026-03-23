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
    onSuccess: (data) => { setBubbleMsg(data.message); setLoading(false); invalidate(); },
    onError: () => setLoading(false),
  });

  if (!pet) return null;

  const message = bubbleMsg ?? pet.message;

  return (
    <button
      onClick={() => msgMut.mutate()}
      className="w-full glass-card p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 active:scale-[0.98] animate-fade-up stagger-4"
    >
      <div className="relative shrink-0">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))", boxShadow: "0 4px 12px color-mix(in srgb, var(--theme-start) 30%, transparent)" }}
        >
          <RiveCat mood={pet.mood} />
        </div>
        {pet.current_streak > 0 && (
          <span
            className="absolute -top-1.5 -end-1.5 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", boxShadow: "0 2px 6px rgba(245, 158, 11, 0.4)" }}
          >
            {pet.current_streak}
          </span>
        )}
      </div>
      <div className="flex-1 text-start">
        <div
          className="text-[13px] leading-relaxed font-medium"
          style={{
            color: "var(--text-secondary)",
            ...(pet.message_type === "ai" ? { borderInlineStart: "2px solid var(--theme-start)", paddingInlineStart: "10px" } : {}),
          }}
        >
          {loading ? (
            <span className="flex gap-1.5 items-center h-5">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-muted)", animationDelay: `${d}ms` }} />
              ))}
            </span>
          ) : message}
        </div>
      </div>
    </button>
  );
}
