import { Trash2 } from "lucide-react";
import type { EntryOut } from "@/types/api";

interface Props {
  entry: EntryOut;
  onDelete: (id: string) => void;
}

export default function EntryCard({ entry, onDelete }: Props) {
  const time = new Date(entry.logged_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 truncate">{entry.description}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {time} · {entry.total_calories} kcal
        </p>
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        className="p-2 text-slate-300 hover:text-red-400 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
