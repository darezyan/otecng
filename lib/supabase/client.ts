import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Untyped: this hand-written schema doesn't carry the Relationships metadata
// supabase-js wants for typed nested `select()` embeds. Query results are
// cast to the Row types below at the call site instead (see lib/data/products.ts).
export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
