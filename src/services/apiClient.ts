import axios from "axios";
import { supabase } from "@/lib/supabase";

const DEV_TOKEN_KEY = "nutrilog_dev_token";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
});

apiClient.interceptors.request.use(async (config) => {
  // Check dev token first
  const devToken = localStorage.getItem(DEV_TOKEN_KEY);
  if (devToken) {
    config.headers.Authorization = `Bearer ${devToken}`;
    return config;
  }

  // Normal Supabase auth
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Don't try to refresh dev tokens
      if (localStorage.getItem(DEV_TOKEN_KEY)) {
        localStorage.removeItem(DEV_TOKEN_KEY);
        window.location.href = "/login";
        return Promise.reject(error);
      }
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        window.location.href = "/login";
      } else {
        return apiClient(error.config);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
