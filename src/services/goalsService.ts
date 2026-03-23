import apiClient from "./apiClient";

export interface GoalCalculateRequest {
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: string;
  activity_level: string;
  goal: string;
  goal_weight_kg?: number;
}

export interface GoalCalculateResponse {
  daily_cal_goal: number;
  daily_protein_goal_g: number;
  daily_fat_goal_g: number;
  daily_carbs_goal_g: number;
  daily_water_goal_ml: number;
  bmr: number;
  tdee: number;
}

export async function calculateGoals(req: GoalCalculateRequest): Promise<GoalCalculateResponse> {
  const { data } = await apiClient.post<GoalCalculateResponse>("/api/v1/goals/calculate", req);
  return data;
}
