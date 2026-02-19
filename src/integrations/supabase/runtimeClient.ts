import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const RUNTIME_URL = import.meta.env.VITE_SUPABASE_URL;
const RUNTIME_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Fail fast if env vars are missing — prevents cryptic "invalid URL" errors in production
if (!RUNTIME_URL || !RUNTIME_PUBLISHABLE_KEY) {
  throw new Error(
    '[Supabase] Missing environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.'
  );
}

export const supabaseRuntime = createClient<Database>(RUNTIME_URL, RUNTIME_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

