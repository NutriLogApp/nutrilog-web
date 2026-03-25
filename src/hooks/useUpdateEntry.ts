import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEntry } from "@/services/entriesService";
import type { FoodItem } from "@/types/api";

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: FoodItem[] }) =>
      updateEntry(id, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      qc.invalidateQueries({ queryKey: ["foodLog"] });
      qc.invalidateQueries({ queryKey: ["water"] });
    },
  });
}
