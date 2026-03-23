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
