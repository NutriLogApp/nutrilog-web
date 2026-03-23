import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPetStatus, type PetStatus } from "@/services/petService";

export function usePetStatus() {
  const qc = useQueryClient();

  const query = useQuery<PetStatus>({
    queryKey: ["petStatus"],
    queryFn: getPetStatus,
    refetchInterval: 30 * 60 * 1000, // 30 min
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["petStatus"] });
  }

  return { ...query, invalidate };
}
