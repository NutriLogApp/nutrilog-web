import apiClient from "./apiClient";
import type { ProfileOut, ProfileUpdate } from "@/types/api";

export async function getProfile(): Promise<ProfileOut> {
  const { data } = await apiClient.get<ProfileOut>("/api/v1/profile");
  return data;
}

export async function updateProfile(update: ProfileUpdate): Promise<ProfileOut> {
  const { data } = await apiClient.patch<ProfileOut>("/api/v1/profile", update);
  return data;
}
