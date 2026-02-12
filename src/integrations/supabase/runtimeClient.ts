import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Runtime client aligned with .env variables
const RUNTIME_URL = import.meta.env.VITE_SUPABASE_URL;
const RUNTIME_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseRuntime = createClient<Database>(RUNTIME_URL, RUNTIME_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
