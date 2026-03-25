import apiClient from "./apiClient";
import type { EntryCreate, EntryCreateResponse, EntryOut, FoodItem } from "@/types/api";

export async function listEntries(date: string): Promise<EntryOut[]> {
  const { data } = await apiClient.get<{ entries: EntryOut[] }>(
    "/api/v1/entries",
    { params: { date } },
  );
  return data.entries;
}

export async function createEntry(entry: EntryCreate): Promise<EntryCreateResponse> {
  const { data } = await apiClient.post<EntryCreateResponse>("/api/v1/entries", entry);
  return data;
}

export async function updateEntry(id: string, items: FoodItem[]): Promise<EntryOut> {
  const { data } = await apiClient.patch<EntryOut>(`/api/v1/entries/${id}`, { items });
  return data;
}

export async function deleteEntry(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/entries/${id}`);
}

export interface EntryHistoryResponse {
  entries: EntryOut[];
  next_cursor_time: string | null;
  next_cursor_id: string | null;
  has_more: boolean;
}

export async function getEntryHistory(
  cursorTime?: string,
  cursorId?: string,
  limit: number = 20,
): Promise<EntryHistoryResponse> {
  const params: Record<string, string> = { limit: String(limit) };
  if (cursorTime) params.cursor_time = cursorTime;
  if (cursorId) params.cursor_id = cursorId;
  const { data } = await apiClient.get<EntryHistoryResponse>(
    "/api/v1/entries/history",
    { params },
  );
  return data;
}
