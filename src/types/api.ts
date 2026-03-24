export interface FoodItem {
  food_name: string;
  food_name_he: string | null;
  grams: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  confidence: "high" | "medium" | "low";
  water_ml_added?: number;
}

export interface EntryOut {
  id: string;
  description: string;
  source: string;
  image_url: string | null;
  meal_type: string;
  items: FoodItem[];
  total_calories: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  logged_at: string;
}

export interface EntryCreate {
  description: string;
  source: "text" | "image" | "barcode";
  image_url?: string | null;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  items: FoodItem[];
  logged_at?: string | null;
}

export interface DailyStatsResponse {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  goal_calories: number | null;
  goal_protein_g: number | null;
  goal_fat_g: number | null;
  goal_carbs_g: number | null;
  entries: EntryOut[];
}

export interface DayStats {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  goal_calories: number | null;
  goal_protein_g: number | null;
  goal_fat_g: number | null;
  goal_carbs_g: number | null;
  entry_count: number;
}

export interface RangeStatsResponse {
  days: DayStats[];
}

export interface ProfileOut {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  username: string | null;
  language: string;
  theme: string;
  daily_cal_goal: number | null;
  daily_protein_goal_g: number | null;
  daily_fat_goal_g: number | null;
  daily_carbs_goal_g: number | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  activity_level: string | null;
  daily_water_goal_ml: number;
  goal_weight_kg: number | null;
  onboarding_done: boolean;
  use_24h: boolean;
  first_day_of_week: number;
  friend_code: string | null;
  current_streak: number;
  longest_streak: number;
}

export interface ProfileUpdate {
  language?: string;
  theme?: string;
  daily_cal_goal?: number;
  daily_protein_goal_g?: number;
  daily_fat_goal_g?: number;
  daily_carbs_goal_g?: number;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  activity_level?: string;
  use_24h?: boolean;
  first_day_of_week?: number;
}

export interface RecentFoodItem {
  food_name: string;
  food_name_he: string | null;
  grams: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  use_count: number;
  last_used_at: string;
}

export interface UserOut {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  language: string;
  theme: string;
}
