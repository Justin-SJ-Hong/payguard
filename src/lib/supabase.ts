import { createClient } from '@supabase/supabase-js';

// 환경변수에서 Supabase URL과 키를 읽어옵니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);