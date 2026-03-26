import { useTranslation } from "react-i18next";
import { formatTime } from "@/lib/formatTime";
import type { EntryOut } from "@/types/api";
import i18n from "@/i18n";

interface EntryRowProps {
  entry: EntryOut;
  use24h: boolean;
  showMacros?: boolean;
  onEdit: (entry: EntryOut) => void;
}

export function EntryRow({
  entry,
  use24h,
  showMacros = true,
  onEdit,
}: EntryRowProps) {
  const { t } = useTranslation();
  const item = entry.items[0];
  const isHe = i18n.language === "he";
  const qty = item?.quantity ?? 1;

  const displayName = item
    ? (isHe && item.food_name_he ? item.food_name_he : item.food_name)
    : entry.description;

  return (
    <div
      onClick={() => onEdit(entry)}
      style={{ cursor: "pointer" }}
    >
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
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

        <div style={{ flex: 1, minWidth: 0 }}>
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
              {displayName}
              {qty > 1 && (
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--theme-accent)",
                    background: "color-mix(in srgb, var(--theme-accent) 12%, transparent)",
                    borderRadius: "6px",
                    padding: "1px 5px",
                    marginLeft: "4px",
                    verticalAlign: "middle",
                  }}
                >
                  x{qty}
                </span>
              )}
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
    </div>
  );
}
