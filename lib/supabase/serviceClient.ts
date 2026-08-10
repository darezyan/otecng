import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only. Bypasses RLS — never import this outside app/api/** route
// handlers or server-only data files (e.g. lib/data/orders.ts). Never
// expose the service-role key to the client.
export function createServiceSupabaseClient() {
  return createClient(supabaseUrl, serviceRoleKey);
}
