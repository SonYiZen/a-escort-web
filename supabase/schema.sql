-- ============================================================================
-- Supabase SQL Schema：girls 資料表（Part 1：建表）
-- 路徑：supabase/schema.sql
-- 用法：整份貼到 Supabase Dashboard → SQL Editor → 直接執行
-- ============================================================================

-- 前置：gen_random_uuid() 需要 pgcrypto（多數專案預設已啟用）
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. 建立 girls 資料表
-- DB 欄位統一 snake_case（image_url / price_range），因 Postgres 未加引號的
-- 識別字會自動轉小寫，用 camelCase 會變 imageurl。前端 Girl 型別維持
-- camelCase，由 lib/girls.ts 負責轉換。
-- 需求欄位外另加 price_label / is_hot / tags / gallery / services /
-- pricing / reviews，否則詳細頁（基礎消費、服務清單、客評截圖）無資料可顯示。
-- ----------------------------------------------------------------------------
create table if not exists public.girls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text not null,
  nationality text not null,
  price integer not null check (price >= 0),
  age integer not null check (age >= 18),
  height integer not null check (height > 0),
  weight integer not null check (weight > 0),
  cup text not null,
  image_url text not null,
  price_range text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  price_label text not null default '',
  is_hot boolean not null default false,
  tags text[] not null default '{}',
  gallery text[] not null default '{}',
  services text[] not null default '{}',
  pricing jsonb not null default '[]'::jsonb,
  reviews text[] not null default '{}'
);

create index if not exists girls_is_active_created_idx
  on public.girls (is_active, created_at desc);


-- ----------------------------------------------------------------------------
-- 2. Row Level Security（MVP：匿名可讀上架中 + 後台可寫；正式上線前請限縮）
-- ----------------------------------------------------------------------------
alter table public.girls enable row level security;

drop policy if exists "girls_public_read_active" on public.girls;
create policy "girls_public_read_active"
  on public.girls for select to anon, authenticated
  using (is_active = true);

drop policy if exists "girls_admin_read_all" on public.girls;
create policy "girls_admin_read_all"
  on public.girls for select to anon, authenticated
  using (true);

drop policy if exists "girls_admin_insert" on public.girls;
create policy "girls_admin_insert"
  on public.girls for insert to anon, authenticated
  with check (true);

drop policy if exists "girls_admin_update" on public.girls;
create policy "girls_admin_update"
  on public.girls for update to anon, authenticated
  using (true) with check (true);

drop policy if exists "girls_admin_delete" on public.girls;
create policy "girls_admin_delete"
  on public.girls for delete to anon, authenticated
  using (true);

-- 正式上線建議：刪掉上面三條 admin 寫入 policy，改用僅登入者可寫
-- create policy "girls_admin_write_authenticated"
--   on public.girls for all to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 3. 種子資料（可選）：把現有 mockData 匯入，id 固定方便驗證路由
--    已有資料時自動跳過（on conflict do nothing）
-- ----------------------------------------------------------------------------
insert into public.girls
  (id, name, region, nationality, price, price_label, age, height, weight, cup,
   image_url, price_range, is_hot, tags, gallery, services, pricing, reviews, is_active)
values
  ('11111111-1111-4111-8111-111111111111', '閃亮亮', '竹北市', '本島台妹', 3500, '3.5K/1s', 23, 163, 48, 'D',
   '/girls/girl-1.svg', '3K - 4K', true,
   array['氣質甜美','可外約','精油SPA'],
   array['/girls/girl-1.svg','/girls/girl-2.svg','/girls/girl-3.svg','/girls/girl-5.svg'],
   array['溫柔殘廢澡','絲足誘惑','配合度高','溫柔聽話'],
   '[{"label":"一節/50min/1S","price":3500,"priceLabel":"$3,500"},{"label":"兩節/100min/2S","price":7000,"priceLabel":"$7,000"},{"label":"三節送一節/200min/NS","price":10500,"priceLabel":"$10,500"}]'::jsonb,
   array['/reviews/review-1.svg','/reviews/review-2.svg'], true),
  ('22222222-2222-4222-8222-222222222222', '白皙糖糖', '新竹市', '白皙泰妹', 2800, '2.8K/1s', 21, 158, 45, 'C',
   '/girls/girl-2.svg', '3K↓', false,
   array['皮膚白皙','美甲造型'],
   array['/girls/girl-2.svg','/girls/girl-6.svg','/girls/girl-4.svg'],
   array['美白護膚','美甲造型','配合度高','氣質交談'],
   '[{"label":"一節/50min/1S","price":2800,"priceLabel":"$2,800"},{"label":"兩節/100min/2S","price":5600,"priceLabel":"$5,600"},{"label":"三節送一節/200min/NS","price":8400,"priceLabel":"$8,400"}]'::jsonb,
   array['/reviews/review-2.svg','/reviews/review-3.svg'], true),
  ('33333333-3333-4333-8333-333333333333', '溫柔阿珠', '竹東', '溫柔越妹', 5200, '5.2K/2s', 25, 167, 51, 'E',
   '/girls/girl-3.svg', '4K - 6K', true,
   array['溫柔體貼','全身按摩'],
   array['/girls/girl-3.svg','/girls/girl-5.svg','/girls/girl-1.svg','/girls/girl-6.svg'],
   array['溫柔殘廢澡','全身油壓','絲足誘惑','配合度高','溫柔聽話'],
   '[{"label":"一節/50min/1S","price":5200,"priceLabel":"$5,200"},{"label":"兩節/100min/2S","price":10400,"priceLabel":"$10,400"},{"label":"三節送一節/200min/NS","price":15600,"priceLabel":"$15,600"}]'::jsonb,
   array['/reviews/review-1.svg','/reviews/review-3.svg','/reviews/review-2.svg'], true),
  ('44444444-4444-4444-8444-444444444444', '熱情莎莎', '竹南', '熱情菲妹', 6800, '6.8K/2s', 24, 170, 54, 'F',
   '/girls/girl-4.svg', '6K以上', false,
   array['熱情活潑','可過夜'],
   array['/girls/girl-4.svg','/girls/girl-2.svg','/girls/girl-6.svg','/girls/girl-3.svg'],
   array['熱情互動','可過夜','角色扮演','配合度高','伴遊外出'],
   '[{"label":"一節/50min/1S","price":6800,"priceLabel":"$6,800"},{"label":"兩節/100min/2S","price":13600,"priceLabel":"$13,600"},{"label":"三節送一節/200min/NS","price":20400,"priceLabel":"$20,400"}]'::jsonb,
   array['/reviews/review-3.svg','/reviews/review-1.svg'], true),
  ('55555555-5555-4555-8555-555555555555', '鄰家小雨', '新竹市', '本島台妹', 4600, '4.6K/1s', 22, 160, 46, 'C',
   '/girls/girl-5.svg', '4K - 6K', false,
   array['鄰家女孩','美甲精油'],
   array['/girls/girl-5.svg','/girls/girl-1.svg','/girls/girl-2.svg'],
   array['溫柔殘廢澡','精油SPA','美甲保養','氣質交談'],
   '[{"label":"一節/50min/1S","price":4600,"priceLabel":"$4,600"},{"label":"兩節/100min/2S","price":9200,"priceLabel":"$9,200"},{"label":"三節送一節/200min/NS","price":13800,"priceLabel":"$13,800"}]'::jsonb,
   array['/reviews/review-2.svg','/reviews/review-1.svg'], true),
  ('66666666-6666-4666-8666-666666666666', '泰奶娜娜', '竹北市', '白皙泰妹', 3200, '3.2K/1s', 20, 155, 43, 'B',
   '/girls/girl-6.svg', '3K - 4K', false,
   array['青春可愛','精油SPA'],
   array['/girls/girl-6.svg','/girls/girl-2.svg','/girls/girl-5.svg'],
   array['可愛互動','精油SPA','絲足誘惑','配合度高'],
   '[{"label":"一節/50min/1S","price":3200,"priceLabel":"$3,200"},{"label":"兩節/100min/2S","price":6400,"priceLabel":"$6,400"},{"label":"三節送一節/200min/NS","price":9600,"priceLabel":"$9,600"}]'::jsonb,
   array['/reviews/review-3.svg','/reviews/review-2.svg'], true)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. 強制 PostgREST 重載 schema 快取（避免「schema cache」殘留舊狀態）
-- ----------------------------------------------------------------------------
notify pgrst, 'reload schema';

-- ----------------------------------------------------------------------------
-- 5. Storage：girl-media 儲存桶（公開讀取，MVP 匿名可上傳）
--    注意：storage.buckets 無法用 IF NOT EXISTS，只能先 INSERT，
--    已存在時會報 duplicate key，可忽略（或先到 Storage 頁面手動建立公開桶）。
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('girl-media', 'girl-media', true)
on conflict (id) do nothing;

-- 公開讀取：任何人可查看 girl-media 內的檔案（前台圖片顯示用）
drop policy if exists "girl-media public read" on storage.objects;
create policy "girl-media public read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'girl-media');

-- MVP 上傳：匿名可上傳（正式上線前請限縮為 authenticated）
drop policy if exists "girl-media anon upload" on storage.objects;
create policy "girl-media anon upload"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'girl-media');

-- MVP 更新／刪除：匿名可管理（正式上線前請限縮為 authenticated）
drop policy if exists "girl-media anon update" on storage.objects;
create policy "girl-media anon update"
  on storage.objects for update to anon, authenticated
  using (bucket_id = 'girl-media') with check (bucket_id = 'girl-media');

drop policy if exists "girl-media anon delete" on storage.objects;
create policy "girl-media anon delete"
  on storage.objects for delete to anon, authenticated
  using (bucket_id = 'girl-media');

-- 正式上線建議：刪掉上面三條 anon 寫入 policy，改用僅登入者可寫
-- create policy "girl-media auth write"
--   on storage.objects for all to authenticated
--   using (bucket_id = 'girl-media') with check (bucket_id = 'girl-media');
