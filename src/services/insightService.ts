import apiClient from "./apiClient";

export interface InsightResponse {
  summary: string;
  suggestion: string;
  source: string;
}

export async function getDailyInsight(): Promise<InsightResponse> {
  const { data } = await apiClient.get<InsightResponse>("/api/v1/insight/today");
  return data;
}
