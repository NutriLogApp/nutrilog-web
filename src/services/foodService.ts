import apiClient from "./apiClient";
import type { FoodItem } from "@/types/api";

export async function parseText(text: string): Promise<FoodItem[]> {
  const { data } = await apiClient.post<{ items: FoodItem[] }>(
    "/api/v1/food/parse-text",
    { text },
  );
  return data.items;
}

export async function parseImage(file: File): Promise<{ image_url: string; items: FoodItem[] }> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await apiClient.post<{ image_url: string; items: FoodItem[] }>(
    "/api/v1/food/parse-image",
    form,
  );
  return data;
}

export async function lookupBarcode(barcode: string): Promise<FoodItem[]> {
  const { data } = await apiClient.get<{ items: FoodItem[] }>(
    `/api/v1/food/barcode/${barcode}`,
  );
  return data.items;
}
