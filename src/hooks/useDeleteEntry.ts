import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEntry } from "@/services/entriesService";

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => deleteEntry(entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dailyStats"] });
      qc.invalidateQueries({ queryKey: ["foodLog"] });
      qc.invalidateQueries({ queryKey: ["water"] });
    },
  });
}
