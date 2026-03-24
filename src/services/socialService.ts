import apiClient from "./apiClient";

export interface Friend {
  user_id: string;
  username: string | null;
  name: string;
}

export interface FriendRequest {
  friendship_id: string;
  requester: Friend;
  created_at: string;
}

export interface GroupOut {
  group_id: string;
  name: string;
  member_count: number;
}

export interface Standing {
  rank: number;
  user_id: string;
  name: string;
  username: string | null;
  total_points: number;
  days_logged: number;
  days_in_week: number;
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  week_start: string;
  standings: Standing[];
}

export async function listFriends(): Promise<Friend[]> {
  const { data } = await apiClient.get<Friend[]>("/api/v1/friends");
  return data;
}

export async function sendFriendRequest(username: string): Promise<void> {
  await apiClient.post("/api/v1/friends/request", { username });
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  const { data } = await apiClient.get<FriendRequest[]>("/api/v1/friends/requests");
  return data;
}

export async function respondToRequest(friendshipId: string, action: string): Promise<void> {
  await apiClient.patch(`/api/v1/friends/${friendshipId}`, { action });
}

export async function searchUser(username: string): Promise<Friend | null> {
  const { data } = await apiClient.get<{ result: Friend | null }>(`/api/v1/friends/search?username=${username}`);
  return data.result;
}

export async function suggestUsers(query: string): Promise<string[]> {
  const { data } = await apiClient.get<{ results: string[] }>(`/api/v1/friends/suggest?q=${encodeURIComponent(query)}`);
  return data.results;
}

export async function setUsername(username: string): Promise<{ username: string; friend_code: string }> {
  const { data } = await apiClient.post<{ username: string; friend_code: string }>("/api/v1/friends/username", { username });
  return data;
}

export async function listGroups(): Promise<GroupOut[]> {
  const { data } = await apiClient.get<GroupOut[]>("/api/v1/groups");
  return data;
}

export async function createGroup(name: string, memberIds: string[]): Promise<void> {
  await apiClient.post("/api/v1/groups", { name, member_ids: memberIds });
}

export async function getLeaderboard(groupId: string): Promise<LeaderboardResponse> {
  const { data } = await apiClient.get<LeaderboardResponse>(`/api/v1/groups/${groupId}/leaderboard`);
  return data;
}

export async function leaveGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/api/v1/groups/${groupId}/members/me`);
}

export async function getTodayPoints(): Promise<{ total_points: number }> {
  const { data } = await apiClient.get<{ total_points: number }>("/api/v1/points/today");
  return data;
}

export async function getWeekPoints(): Promise<{ week_start: string; total_points: number; days: { date: string; total_points: number }[] }> {
  const { data } = await apiClient.get<{ week_start: string; total_points: number; days: { date: string; total_points: number }[] }>("/api/v1/points/week");
  return data;
}
