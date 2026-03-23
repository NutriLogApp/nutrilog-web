import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EntryOut } from "@/types/api";

interface Props {
  entry: EntryOut;
  onDelete: (id: string) => void;
}

export default function EntryCard({ entry, onDelete }: Props) {
  const { t } = useTranslation();
  const time = new Date(entry.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="glass-card-sm p-4 flex items-center gap-3 transition-all duration-200 hover:scale-[1.01]">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{entry.description}</p>
        <p className="text-[11px] mt-1 font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
          {time} · {entry.total_calories} {t("dashboard.kcal")}
        </p>
      </div>
      <button
        onClick={() => onDelete(entry.id)}
        className="p-2 rounded-full transition-all duration-200 hover:bg-red-500/10 active:scale-90"
        style={{ color: "var(--text-muted)" }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
