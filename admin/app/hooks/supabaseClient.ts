import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_BASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// Use a global variable to persist the client across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var supabaseClient: SupabaseClient | undefined;
}

const client =
  globalThis.supabaseClient || createClient(supabaseUrl, supabaseKey);

if (!globalThis.supabaseClient) {
  globalThis.supabaseClient = client;
}

export default client;
