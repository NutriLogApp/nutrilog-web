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
    <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: "var(--bg-card)" }}>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{entry.description}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {time} · {entry.total_calories} {t("dashboard.kcal")}
        </p>
      </div>
      <button onClick={() => onDelete(entry.id)} className="p-2 hover:text-red-400 transition-colors" style={{ color: "var(--text-muted)" }}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}
