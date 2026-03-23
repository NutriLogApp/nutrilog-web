import apiClient from "./apiClient";

export interface DrinkOut {
  id: string;
  name: string;
  name_he: string | null;
  icon: string;
  volume_ml: number;
  calories: number;
  sugar_g: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  counts_as_water: boolean;
  water_pct: number;
}

export interface DrinkCreate {
  name: string;
  name_he?: string | null;
  icon?: string;
  volume_ml: number;
  calories?: number;
  sugar_g?: number;
  protein_g?: number;
  fat_g?: number;
  carbs_g?: number;
  counts_as_water?: boolean;
  water_pct?: number;
}

export interface DrinkParseResult {
  name: string;
  name_he: string;
  icon: string;
  volume_ml: number;
  calories: number;
  sugar_g: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  water_pct: number;
}

export async function listDrinks(): Promise<DrinkOut[]> {
  const { data } = await apiClient.get<DrinkOut[]>("/api/v1/drinks");
  return data;
}

export async function parseDrink(text: string): Promise<DrinkParseResult> {
  const { data } = await apiClient.post<DrinkParseResult>("/api/v1/drinks/parse", { text });
  return data;
}

export async function createDrink(drink: DrinkCreate): Promise<DrinkOut> {
  const { data } = await apiClient.post<DrinkOut>("/api/v1/drinks", drink);
  return data;
}

export async function deleteDrink(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/drinks/${id}`);
}
