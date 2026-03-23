import apiClient from "./apiClient";

export interface WaterResponse {
  date: string;
  amount_ml: number;
  goal_ml: number;
}

export async function getTodayWater(): Promise<WaterResponse> {
  const { data } = await apiClient.get<WaterResponse>("/api/v1/water/today");
  return data;
}

export async function addWater(amount_ml: number): Promise<WaterResponse> {
  const { data } = await apiClient.post<WaterResponse>("/api/v1/water/add", { amount_ml });
  return data;
}
