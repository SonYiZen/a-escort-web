/**
 * Supabase girls 資料存取層：DB snake_case ↔ 前端 Girl camelCase 轉換
 * 路徑：lib/girls.ts
 */

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { girlsData as mockGirls } from "@/data/mockData";
import type { Girl, PricingPlan } from "@/types";

/** Supabase girls 表的原始列型別（snake_case） */
export interface GirlRow {
  id: string;
  name: string;
  region: string;
  nationality: string;
  price: number;
  age: number;
  height: number;
  weight: number;
  cup: string;
  image_url: string;
  price_range: string;
  is_active: boolean;
  created_at: string;
  price_label: string;
  is_hot: boolean;
  tags: string[] | null;
  gallery: string[] | null;
  services: string[] | null;
  pricing: PricingPlan[] | null;
  reviews: string[] | null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function toPricingArray(value: unknown): PricingPlan[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is PricingPlan =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as PricingPlan).label === "string" &&
        typeof (v as PricingPlan).priceLabel === "string",
    )
    .map((v) => ({
      label: v.label,
      price: typeof v.price === "number" ? v.price : 0,
      priceLabel: v.priceLabel,
    }));
}

/** DB 列 → 前端 Girl */
export function mapRowToGirl(row: GirlRow): Girl {
  return {
    id: row.id,
    name: row.name,
    region: row.region as Girl["region"],
    nationality: row.nationality as Girl["nationality"],
    price: row.price,
    priceLabel: row.price_label || `${(row.price / 1000).toFixed(1)}K/1s`,
    age: row.age,
    height: row.height,
    weight: row.weight,
    cup: row.cup,
    priceRange: row.price_range as Girl["priceRange"],
    imageUrl: row.image_url,
    isActive: row.is_active,
    isHot: row.is_hot,
    tags: toStringArray(row.tags),
    gallery: toStringArray(row.gallery),
    services: toStringArray(row.services),
    pricing: toPricingArray(row.pricing),
    reviews: toStringArray(row.reviews),
  };
}

/** 前端表單 → DB 寫入 payload（snake_case） */
export interface GirlInsert {
  name: string;
  region: string;
  nationality: string;
  price: number;
  price_label: string;
  age: number;
  height: number;
  weight: number;
  cup: string;
  image_url: string;
  price_range: string;
  is_hot?: boolean;
  tags?: string[];
  gallery?: string[];
  services?: string[];
  pricing?: PricingPlan[];
  reviews?: string[];
  is_active?: boolean;
}

/** 前台：只讀取上架中的佳人（is_active = true），未設定 env 時降級為 mockData */
export async function fetchActiveGirls(): Promise<Girl[]> {
  if (!isSupabaseConfigured()) return mockGirls.filter(() => true);
  const { data, error } = await supabase
    .from("girls")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[girls] fetchActiveGirls 失敗，降級為 mockData：", error.message);
    return mockGirls;
  }
  return (data as GirlRow[]).map(mapRowToGirl);
}

/** 詳細頁：依 id 查單一佳人（含下架判斷由呼叫端決定） */
export async function fetchGirlById(id: string): Promise<Girl | null> {
  if (!isSupabaseConfigured()) {
    return mockGirls.find((g) => g.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from("girls")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[girls] fetchGirlById 失敗：", error.message);
    return null;
  }
  if (!data) return null;
  return mapRowToGirl(data as GirlRow);
}

/** 後台：讀取全部（含下架），依建立時間倒序 */
export async function fetchAllGirlsAdmin(): Promise<GirlRow[]> {
  const { data, error } = await supabase
    .from("girls")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as GirlRow[];
}
