import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let cachedServerClient = null;

export function createSupabaseServerClient(
  supabaseUrl = process.env.SUPABASE_URL,
  serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  if (cachedServerClient) return cachedServerClient;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is missing. Set it in environment variables.");
  }
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing. Set it server-side only.");
  }

  // Create a server-only client. Do not import or use this in the client/browser.
  const client = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: { fetch },
  });

  cachedServerClient = client;
  return client;
}


