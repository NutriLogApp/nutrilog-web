const GRADIENTS = [
  ["#0d9488", "#0891b2"],
  ["#8b5cf6", "#6d28d9"],
  ["#f59e0b", "#d97706"],
  ["#ec4899", "#db2777"],
  ["#10b981", "#059669"],
  ["#3b82f6", "#2563eb"],
  ["#f97316", "#ea580c"],
  ["#6366f1", "#4f46e5"],
  ["#14b8a6", "#0d9488"],
  ["#e11d48", "#be123c"],
];

const SIZES = {
  sm: { box: "w-9 h-9", text: "text-[13px]" },
  md: { box: "w-12 h-12", text: "text-lg" },
  lg: { box: "w-16 h-16", text: "text-2xl" },
} as const;

function hashToIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % GRADIENTS.length;
}

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  userId?: string;
}

export default function Avatar({ name, avatarUrl, size = "md", userId }: AvatarProps) {
  const s = SIZES[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${s.box} rounded-full object-cover`}
      />
    );
  }

  const initial = (name || "?").charAt(0).toUpperCase();
  const [start, end] = GRADIENTS[hashToIndex(userId || name)];

  return (
    <div
      className={`${s.box} rounded-full flex items-center justify-center shrink-0`}
      style={{ background: `linear-gradient(135deg, ${start}, ${end})` }}
    >
      <span className={`${s.text} font-bold text-white`}>{initial}</span>
    </div>
  );
}
