import { UtensilsCrossed, Droplets } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  onAddFood: () => void;
  onAddDrink: () => void;
}

export function QuickActions({ onAddFood, onAddDrink }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center gap-[10px] px-4 py-[10px]">
      <button
        onClick={onAddFood}
        className="flex items-center gap-1.5 px-5 py-[10px] rounded-full font-semibold text-xs text-white transition-all duration-200 active:scale-[0.97]"
        style={{
          background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <UtensilsCrossed size={16} />
        {t("home.addFood")}
      </button>
      <button
        onClick={onAddDrink}
        className="flex items-center gap-1.5 px-5 py-[10px] rounded-full font-semibold text-xs transition-all duration-200 active:scale-[0.97]"
        style={{
          background: "var(--bg-card-solid)",
          color: "var(--theme-accent)",
          border: "1.5px solid color-mix(in srgb, var(--theme-accent) 20%, transparent)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Droplets size={16} />
        {t("home.addDrink")}
      </button>
    </div>
  );
}
