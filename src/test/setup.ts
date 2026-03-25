import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock supabase globally — prevents "Missing Supabase environment variables" throw
// during tests that transitively import apiClient → supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      refreshSession: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));
