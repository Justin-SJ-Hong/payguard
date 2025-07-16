interface ImportMetaEnv {
  readonly VITE_TRANSFI_CLIENT_ID: string
  readonly VITE_TRANSFI_CLIENT_SECRET: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PAYPAL_CLIENT_ID: string
  readonly VITE_PAYPAL_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}