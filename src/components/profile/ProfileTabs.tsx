import { useTranslation } from "react-i18next";

export type TabName = "stats" | "friends" | "log" | "weight";

const TABS: TabName[] = ["stats", "friends", "log", "weight"];

interface Props {
  active: TabName;
  onChange: (tab: TabName) => void;
}

export default function ProfileTabs({ active, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="flex mx-5 sticky top-0 z-30"
      style={{ backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border)" }}
    >
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="flex-1 py-3 text-[13px] font-semibold transition-all"
          style={{
            color: active === tab ? "var(--theme-accent)" : "var(--text-muted)",
            borderBottom: active === tab ? "2px solid var(--theme-accent)" : "2px solid transparent",
          }}
        >
          {t(`profileTabs.${tab}`)}
        </button>
      ))}
    </div>
  );
}
