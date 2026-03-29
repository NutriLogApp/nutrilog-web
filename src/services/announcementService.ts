import apiClient from "./apiClient";

export interface AnnouncementOut {
  id: string;
  title: string;
  body: string | null;
  active: boolean;
  created_at: string;
}

export interface AnnouncementCreate {
  title: string;
  body?: string;
}

export interface AnnouncementUpdate {
  title?: string;
  body?: string;
  active?: boolean;
}

export async function getActiveAnnouncements(): Promise<AnnouncementOut[]> {
  const { data } = await apiClient.get<AnnouncementOut[]>("/api/v1/notifications/announcements");
  return data;
}

export async function getAdminAnnouncements(): Promise<AnnouncementOut[]> {
  const { data } = await apiClient.get<AnnouncementOut[]>("/api/v1/admin/announcements");
  return data;
}

export async function createAnnouncement(body: AnnouncementCreate): Promise<AnnouncementOut> {
  const { data } = await apiClient.post<AnnouncementOut>("/api/v1/admin/announcements", body);
  return data;
}

export async function updateAnnouncement(id: string, body: AnnouncementUpdate): Promise<AnnouncementOut> {
  const { data } = await apiClient.patch<AnnouncementOut>(`/api/v1/admin/announcements/${id}`, body);
  return data;
}
