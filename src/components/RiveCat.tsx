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
}

/**
 * RiveCat: Currently renders emoji fallback.
 * To activate Rive animations:
 * 1. Create a .riv file in Rive editor with state machine "moods"
 * 2. Place at public/rive/cat.riv
 * 3. Uncomment the Rive loading code below
 */
export default function RiveCat({ mood }: Props) {
  // Rive integration placeholder — uncomment when .riv file is ready:
  // import("@rive-app/react-canvas") for dynamic loading

  const emoji = MOOD_EMOJI[mood] ?? "😺";
  const anim = MOOD_ANIM[mood] ?? "";
  return <span className={`text-2xl ${anim}`}>{emoji}</span>;
}
