import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] 请在 .env 中配置 REACT_APP_SUPABASE_URL 与 REACT_APP_SUPABASE_ANON_KEY',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window === 'undefined' ? undefined : window.localStorage,
    },
  },
)
