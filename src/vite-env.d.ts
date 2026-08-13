/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_SUPABASE_URL: string
  readonly REACT_APP_SUPABASE_ANON_KEY: string
  readonly REACT_APP_VAPID_PUBLIC_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
