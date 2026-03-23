import { useEffect, useState } from "react";

// Rive is optional — only loads if .riv file exists
let RiveComponent: React.ComponentType<{ src: string; stateMachines: string; className?: string }> | null = null;

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

interface Props {
  mood: string;
  size?: number;
}

/**
 * RiveCat: renders a Rive animation if `/rive/cat.riv` exists,
 * otherwise falls back to emoji.
 *
 * To activate Rive:
 * 1. Create a .riv file with a state machine called "moods"
 *    and 5 states: ecstatic, happy, meh, sad, hungry
 * 2. Place it at public/rive/cat.riv
 * 3. The component will auto-detect and use it
 *
 * The state machine should have a numeric input called "mood"
 * where: 0=hungry, 1=sad, 2=meh, 3=happy, 4=ecstatic
 */
export default function RiveCat({ mood, size = 56 }: Props) {
  const [useRive, setUseRive] = useState(false);
  const [RiveComp, setRiveComp] = useState<typeof RiveComponent>(null);

  useEffect(() => {
    // Check if .riv file exists
    fetch("/rive/cat.riv", { method: "HEAD" })
      .then((r) => {
        if (r.ok) {
          // Dynamically import Rive only if file exists
          import("@rive-app/react-canvas").then((mod) => {
            setRiveComp(() => mod.default);
            setUseRive(true);
          });
        }
      })
      .catch(() => {});
  }, []);

  if (useRive && RiveComp) {
    return (
      <div style={{ width: size, height: size }}>
        <RiveComp
          src="/rive/cat.riv"
          stateMachines="moods"
          className="w-full h-full"
        />
      </div>
    );
  }

  // Fallback: styled emoji
  const emoji = MOOD_EMOJI[mood] ?? "😺";
  const anim = MOOD_ANIM[mood] ?? "";

  return <span className={`text-2xl ${anim}`}>{emoji}</span>;
}
