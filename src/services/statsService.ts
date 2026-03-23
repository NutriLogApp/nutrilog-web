import apiClient from "./apiClient";
import type { DailyStatsResponse, RangeStatsResponse } from "@/types/api";

export async function getDailyStats(date: string): Promise<DailyStatsResponse> {
  const { data } = await apiClient.get<DailyStatsResponse>(
    "/api/v1/stats/daily",
    { params: { date } },
  );
  return data;
}

export async function getRangeStats(start: string, end: string): Promise<RangeStatsResponse> {
  const { data } = await apiClient.get<RangeStatsResponse>(
    "/api/v1/stats/range",
    { params: { start, end } },
  );
  return data;
}
