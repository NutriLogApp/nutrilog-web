import apiClient from "./apiClient";

export interface InsightResponse {
  summary: string;
  suggestion: string;
  source: string;
  refreshes_left: number;
  category?: "positive" | "warning" | "suggestion" | "motivational";
}

export async function getDailyInsight(): Promise<InsightResponse> {
  const { data } = await apiClient.get<InsightResponse>("/api/v1/insight/today");
  return data;
}

export async function refreshInsight(): Promise<InsightResponse> {
  const { data } = await apiClient.post<InsightResponse>("/api/v1/insight/refresh");
  return data;
}
