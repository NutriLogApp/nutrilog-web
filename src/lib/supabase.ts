import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  throw new Error(
    "Missing Supabase environment variables. Copy .env.example to .env and fill in the values."
  );
}

export const supabase = createClient(url, key);
