import { formatTime } from "@/lib/formatTime";
import type { EntryOut } from "@/types/api";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";

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
                marginInlineEnd: "8px",
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
                    marginInlineStart: "4px",
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
              {Math.round(entry.total_calories)} {t("units.cal")}
            </span>
          </div>

          {showMacros && (
            <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
              <span style={{ fontSize: "9px", fontWeight: 600, color: "#0d9488" }}>
                {t("macros.proteinShort")} {Math.round(entry.total_protein_g)} {t("log.g")}
              </span>
              <span style={{ fontSize: "9px", fontWeight: 600, color: "#f59e0b" }}>
                {t("macros.fatShort")} {Math.round(entry.total_fat_g)} {t("log.g")}
              </span>
              <span style={{ fontSize: "9px", fontWeight: 600, color: "#ec4899" }}>
                {t("macros.carbsShort")} {Math.round(entry.total_carbs_g)} {t("log.g")}
              </span>
            </div>
          )}
          {item?.is_drink && (item.water_pct ?? 0) > 0 && (
            <div style={{ display: "flex", gap: "4px", marginTop: "2px", alignItems: "center" }}>
              <span style={{ fontSize: "9px", fontWeight: 600, color: "#38bdf8", display: "flex", alignItems: "center", gap: "2px" }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
                {Math.round(((item.volume_ml ?? item.grams ?? 0) * (item.water_pct ?? 0)) / 100)} {t("water.ml")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
