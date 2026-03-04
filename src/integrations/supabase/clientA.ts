import { createClient } from "@supabase/supabase-js";

const SUPABASE_A_URL = import.meta.env.VITE_SUPABASE_A_URL;
const SUPABASE_A_ANON_KEY = import.meta.env.VITE_SUPABASE_A_ANON_KEY;

// Read-only client for Supabase Project A (bot profiles/photos).
// No session persistence — this project is not the auth source for this funnel.
export const supabaseA = createClient(SUPABASE_A_URL, SUPABASE_A_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
