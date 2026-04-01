import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qdoagbhqjmmvvyjkpjdf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkb2FnYmhxam1tdnZ5amtwamRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Mjg2ODEsImV4cCI6MjA4ODMwNDY4MX0.ET6z-CsmMxw_chri6qcyinAs9tmdEBAlA7n38rfFsFI'

// Safe: only create client if env vars are present
// During build/SSR without env vars, supabase will be null
let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Fallback no-op client for when Supabase is not configured
const noopClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
    signUp: async () => ({ error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
}

export { supabase }
export const supabaseClient = (supabase ?? noopClient) as SupabaseClient
