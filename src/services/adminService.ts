import apiClient from "./apiClient";
import type { UserOut } from "@/types/api";

export async function listUsers(): Promise<UserOut[]> {
  const { data } = await apiClient.get<UserOut[]>("/api/v1/admin/users");
  return data;
}

export async function updateUserStatus(userId: string, status: string): Promise<UserOut> {
  const { data } = await apiClient.patch<UserOut>(
    `/api/v1/admin/users/${userId}/status`,
    { status },
  );
  return data;
}

export interface RecalculateResult {
  entries_updated: number;
  entries_skipped: number;
  recent_foods_updated: number;
  unique_foods_detected: number;
  errors: string[];
}

export async function recalculateEntries(): Promise<RecalculateResult> {
  const { data } = await apiClient.post<RecalculateResult>("/api/v1/admin/recalculate-entries");
  return data;
}
