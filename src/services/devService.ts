import apiClient from "./apiClient";

export async function seedScenario(scenario: string): Promise<void> {
  await apiClient.post("/api/v1/dev/seed-scenario", { scenario });
}
