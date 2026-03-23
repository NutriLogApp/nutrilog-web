import apiClient from "./apiClient";
import type { RecentFoodItem } from "@/types/api";

export async function getRecentFoods(limit = 8): Promise<RecentFoodItem[]> {
  const { data } = await apiClient.get<{ items: RecentFoodItem[] }>(
    "/api/v1/recent-foods",
    { params: { limit } },
  );
  return data.items;
}
