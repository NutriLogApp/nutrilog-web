import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatTime } from "@/lib/formatTime";
import type { EntryOut } from "@/types/api";

interface EntryRowProps {
  entry: EntryOut;
  use24h: boolean;
  showMacros?: boolean;
  isExpanded: boolean;
  onTap: () => void;
  onEdit: (entry: EntryOut) => void;
  onDelete: (entry: EntryOut) => void;
}

export function EntryRow({
  entry,
  use24h,
  showMacros = true,
  isExpanded,
  onTap,
  onEdit,
  onDelete,
}: EntryRowProps) {
  const { t } = useTranslation();
  const expandedBg = "color-mix(in srgb, var(--theme-accent) 4%, var(--bg-card-solid))";

  return (
    <div
      onClick={onTap}
      style={{
        background: isExpanded ? expandedBg : undefined,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        {/* Time column */}
        <span
          style={{
            fontSize: "10px",
            color: "var(--text-muted)",
            fontVariantNumeric: "tabular-nums",
            minWidth: "34px",
            alignSelf: "flex-start",
            marginTop: "2px",
          }}
        >
          {formatTime(entry.logged_at, use24h)}
        </span>

        {/* Body column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top line */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                minWidth: 0,
                marginRight: "8px",
              }}
            >
              {entry.description}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--theme-accent)",
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
              }}
            >
              {Math.round(entry.total_calories)} cal
            </span>
          </div>

          {/* Macros line */}
          {showMacros && (
            <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
              <span style={{ fontSize: "9px", fontWeight: 600, color: "#0d9488" }}>
                {Math.round(entry.total_protein_g)}g P
              </span>
              <span style={{ fontSize: "9px", fontWeight: 600, color: "#f59e0b" }}>
                {Math.round(entry.total_fat_g)}g F
              </span>
              <span style={{ fontSize: "9px", fontWeight: 600, color: "#ec4899" }}>
                {Math.round(entry.total_carbs_g)}g C
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded action panel */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", gap: "8px", padding: "8px 0 4px" }}
        >
          <button
            onClick={() => onEdit(entry)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "10px",
              padding: "6px 14px",
              background: "color-mix(in srgb, var(--theme-accent) 10%, transparent)",
              color: "var(--theme-accent)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Pencil size={12} />
            {t("myday.editEntry")}
          </button>
          <button
            onClick={() => onDelete(entry)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "10px",
              padding: "6px 14px",
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Trash2 size={12} />
            {t("common.delete")}
          </button>
        </div>
      )}
    </div>
  );
}
