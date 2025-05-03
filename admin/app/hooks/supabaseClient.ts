import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Check if the client has already been created to avoid multiple instances
let supabaseClient: SupabaseClient | null = null

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_BASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

if (!supabaseClient) {
  supabaseClient = createClient(supabaseUrl, supabaseKey)
}

export default supabaseClient
