import apiClient from "@/services/apiClient";

export async function submitFeedback(
  message: string,
  screenshot: Blob | null,
  pageUrl: string,
): Promise<void> {
  const formData = new FormData();
  formData.append("message", message);
  formData.append("page_url", pageUrl);
  formData.append("screen_width", String(window.screen.width));
  formData.append("screen_height", String(window.screen.height));

  if (screenshot) {
    formData.append("screenshot", screenshot, "screenshot.png");
  }

  await apiClient.post("/api/v1/feedback", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
