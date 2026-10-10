/**
 * Supabase 客戶端初始化
 * 路徑：lib/supabase.ts
 *
 * 讀取 process.env.SUPABASE_URL 與 process.env.SUPABASE_ANON_KEY，
 * 同時相容 NEXT_PUBLIC_ 前綴（瀏覽器端只能讀到 NEXT_PUBLIC_ 開頭的變數）。
 * 未設定時不 throw，呼叫端以 isSupabaseConfigured() 決定是否降級為 mockData，
 * 避免 Vercel 忘記設 env 就整站 build 失敗。
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] 缺少 SUPABASE_URL / SUPABASE_ANON_KEY（或 NEXT_PUBLIC_ 版本），將降級使用 mockData。",
  );
}

function createFallbackClient(): SupabaseClient {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(
          "[supabase] 尚未設定 SUPABASE_URL / SUPABASE_ANON_KEY，請先設定環境變數。",
        );
      },
    },
  ) as SupabaseClient;
}

export const supabase: SupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createFallbackClient();

/** Supabase 是否已正確設定 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
