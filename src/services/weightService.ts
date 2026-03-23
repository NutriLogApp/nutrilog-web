import apiClient from "./apiClient";

export interface WeightEntry {
  date: string;
  weight_kg: number;
}

export async function logWeight(weight_kg: number): Promise<WeightEntry> {
  const { data } = await apiClient.post<WeightEntry>("/api/v1/weight", { weight_kg });
  return data;
}

export async function getWeightHistory(): Promise<WeightEntry[]> {
  const { data } = await apiClient.get<{ entries: WeightEntry[] }>("/api/v1/weight/history");
  return data.entries;
}
