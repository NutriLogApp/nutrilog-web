import apiClient from "./apiClient";

export interface PetStatus {
  mood: string;
  active_cat: string;
  current_streak: number;
  longest_streak: number;
  message: string;
  message_type: string;
  time_of_day_state: string;
}

export interface CatInfo {
  name: string;
  emoji: string;
  unlocked: boolean;
  unlock_streak: number;
  unlocked_at: string | null;
}

export interface CollectionResponse {
  cats: CatInfo[];
  active_cat: string;
}

export interface EatingWindowItem {
  meal_type: string;
  start_time: string;
  end_time: string;
}

export async function getPetStatus(): Promise<PetStatus> {
  const { data } = await apiClient.get<PetStatus>("/api/v1/pet/status");
  return data;
}

export async function getCollection(): Promise<CollectionResponse> {
  const { data } = await apiClient.get<CollectionResponse>("/api/v1/pet/collection");
  return data;
}

export async function setActiveCat(catName: string): Promise<void> {
  await apiClient.post("/api/v1/pet/active-cat", { cat_name: catName });
}

export async function getEatingWindows(): Promise<EatingWindowItem[]> {
  const { data } = await apiClient.get<{ windows: EatingWindowItem[] }>("/api/v1/pet/eating-windows");
  return data.windows;
}

export async function updateEatingWindows(windows: EatingWindowItem[]): Promise<EatingWindowItem[]> {
  const { data } = await apiClient.put<{ windows: EatingWindowItem[] }>("/api/v1/pet/eating-windows", { windows });
  return data.windows;
}

export async function refreshMessage(): Promise<{ message: string; message_type: string }> {
  const { data } = await apiClient.post<{ message: string; message_type: string }>("/api/v1/pet/message");
  return data;
}
