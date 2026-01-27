import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Runtime client to avoid broken env vars after remix.
// Uses publishable credentials (safe to ship to the browser).
// Pointing to exported project: cpqsfixvpbtbqoaarcjq
const RUNTIME_URL = "https://cpqsfixvpbtbqoaarcjq.supabase.co";
const RUNTIME_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwcXNmaXh2cGJ0YnFvYWFyY2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NjkxMjYsImV4cCI6MjA4NTA0NTEyNn0.iuIAHVudIdQZYwsnDdjqxr-Vg7wMdC8L1hTr35SoLmk";

export const supabaseRuntime = createClient<Database>(RUNTIME_URL, RUNTIME_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
