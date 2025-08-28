import { createClient } from '@supabase/supabase-js';

// 환경변수에서 Supabase URL과 키를 읽어옵니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // 빌드/배포 환경에서 값 주입 실패 시 조기 감지
  // eslint-disable-next-line no-console
  console.error('[Supabase] Missing env. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  // 런타임에서 조용히 실패하지 않도록 명확한 예외를 던집니다
  throw new Error('Supabase env missing. Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);