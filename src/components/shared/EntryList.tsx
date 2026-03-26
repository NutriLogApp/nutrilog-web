import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EntryRow } from "./EntryRow";
import type { EntryOut } from "@/types/api";

interface EntryListProps {
  entries: EntryOut[];
  use24h: boolean;
  onEdit: (entry: EntryOut) => void;
  onDelete: (entry: EntryOut) => void;
}

export function EntryList({ entries, use24h, onEdit, onDelete }: EntryListProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...entries].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );

  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      {sorted.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "var(--text-muted)",
            padding: "20px",
          }}
        >
          {t("home.noEntries")}
        </div>
      ) : (
        sorted.map((entry, index) => (
          <div key={entry.id}>
            <div className="px-3 py-2">
              <EntryRow
                entry={entry}
                use24h={use24h}
                isExpanded={expandedId === entry.id}
                onTap={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
            {index < sorted.length - 1 && (
              <div
                style={{
                  height: "1px",
                  background: "var(--border-light)",
                  marginLeft: "50px",
                }}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
