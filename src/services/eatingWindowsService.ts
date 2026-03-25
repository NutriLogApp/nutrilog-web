import apiClient from "./apiClient";

export interface EatingWindowItem {
  meal_type: string;
  start_time: string;
  end_time: string;
}

export async function getEatingWindows(): Promise<EatingWindowItem[]> {
  const { data } = await apiClient.get<{ windows: EatingWindowItem[] }>("/api/v1/eating-windows");
  return data.windows;
}

export async function updateEatingWindows(windows: EatingWindowItem[]): Promise<EatingWindowItem[]> {
  const { data } = await apiClient.put<{ windows: EatingWindowItem[] }>("/api/v1/eating-windows", { windows });
  return data.windows;
}
