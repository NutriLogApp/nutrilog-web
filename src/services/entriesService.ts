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
