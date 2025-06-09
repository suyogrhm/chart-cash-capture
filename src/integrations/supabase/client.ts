
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lamjahuwnqnazvhguwug.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbWphaHV3bnFuYXp2aGd1d3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NTEwMDMsImV4cCI6MjA2NTAyNzAwM30.TkW3_E5NRuEyDcPfXMbODJ1tL4qIxdI9-f5fgpxkAZQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
})
