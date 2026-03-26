import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Check, Loader2, UtensilsCrossed } from "lucide-react";
import { createEntry } from "@/services/entriesService";
import type { FoodSuggestion } from "@/services/chatService";

interface LogMealButtonProps {
  foods: FoodSuggestion[];
}

export default function LogMealButton({ foods }: LogMealButtonProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [logged, setLogged] = useState(false);

  const logMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        foods.map((food) =>
          createEntry({
            description: food.food_name,
            source: "text",
            meal_type: "snack",
            items: [
              {
                food_name: food.food_name,
                food_name_he: food.food_name_he ?? null,
                grams: food.grams,
                calories: food.calories,
                protein_g: food.protein_g,
                fat_g: food.fat_g,
                carbs_g: food.carbs_g,
                confidence: "medium",
              },
            ],
          }),
        ),
      );
    },
    onSuccess: () => {
      setLogged(true);
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  if (logged) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mt-2 transition-all"
        style={{
          background: "var(--bg-input)",
          color: "var(--text-muted)",
        }}
      >
        <Check size={14} />
        {t("chat.logged")}
      </button>
    );
  }

  return (
    <button
      onClick={() => logMutation.mutate()}
      disabled={logMutation.isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mt-2 transition-all"
      style={{
        background: logMutation.isPending
          ? "var(--bg-input)"
          : "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
        color: logMutation.isPending ? "var(--text-muted)" : "#fff",
      }}
    >
      {logMutation.isPending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          {t("chat.logging")}
        </>
      ) : (
        <>
          <UtensilsCrossed size={14} />
          {t("chat.logMeal")}
        </>
      )}
    </button>
  );
}
