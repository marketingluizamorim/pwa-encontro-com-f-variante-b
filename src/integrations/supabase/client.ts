// Single Supabase client — re-exports the runtime singleton so the entire
// app shares one session. Do NOT create a second client here.
// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export { supabaseRuntime as supabase } from './runtimeClient';