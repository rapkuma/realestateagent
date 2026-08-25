import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL or Anon Key is missing. Please check your .env.local file.'
  );
}

// 기본 Supabase 클라이언트 (Service Role Key가 유효하게 있으면 서버 권한으로 우선 초기화)
const effectiveKey =
  serviceRoleKey && serviceRoleKey !== 'your_supabase_service_role_key_here'
    ? serviceRoleKey
    : supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  effectiveKey,
  {
    auth: {
      persistSession: false,
    },
  }
);
