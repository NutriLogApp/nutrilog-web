import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL as string;
const DEV_TOKEN_KEY = "mealriot_dev_token";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FoodSuggestion {
  food_name: string;
  food_name_he?: string;
  grams: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export type ChatEvent =
  | { type: "token"; token: string }
  | { type: "foods"; foods: FoodSuggestion[] }
  | { type: "error"; error: string }
  | { type: "done" };

async function getAuthToken(): Promise<string | null> {
  const devToken = localStorage.getItem(DEV_TOKEN_KEY);
  if (devToken) return devToken;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function* streamChat(
  message: string,
  history: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<ChatEvent> {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!response.ok) {
    if (response.status === 429) {
      yield { type: "error", error: "Too many requests. Please wait a moment." };
      yield { type: "done" };
      return;
    }
    yield { type: "error", error: "Something went wrong. Please try again." };
    yield { type: "done" };
    return;
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const payload = trimmed.slice(6);
        if (payload === "[DONE]") {
          yield { type: "done" };
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          if ("token" in parsed) {
            yield { type: "token", token: parsed.token };
          } else if ("foods" in parsed) {
            yield { type: "foods", foods: parsed.foods };
          } else if ("error" in parsed) {
            yield { type: "error", error: parsed.error };
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { type: "done" };
}
