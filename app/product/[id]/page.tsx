import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import { LINE_URL, TELEGRAM_URL } from "@/data/mockData";
import { fetchGirlById } from "@/lib/girls";
import type { Girl } from "@/types";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 依 id 動態產生頁面標題（SEO），直接向 Supabase 查詢
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const girl = await fetchGirlById(id);

  if (!girl) {
    return { title: "此對象暫時不在線或已被下架" };
  }

  return {
    title: `${girl.name} - 尊爵嚴選`,
    description: `${girl.region}｜${girl.nationality}｜${girl.priceLabel}｜${girl.age}歲 ${girl.height}cm ${girl.cup}罩杯`,
  };
}

/** 核心數據面板的一列 */
function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-400/10 py-2.5 last:border-b-0">
      <span className="shrink-0 text-xs tracking-wider text-amber-300/70">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}

/** 服務內容勾選清單的一項 */
function ServiceItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-[11px] font-black text-black shadow-[0_0_10px_rgba(251,191,36,0.35)]"
        aria-hidden="true"
      >
        ✓
      </span>
      <span className="text-sm text-zinc-200">{text}</span>
    </li>
  );
}
/** 基礎消費方案的一列 */
function PricingRow({ label, priceLabel }: { label: string; priceLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-400/10 py-3 last:border-b-0">
      <span className="text-sm text-zinc-200">{label}</span>
      <span className="text-base font-bold tracking-wide text-red-400">
        {priceLabel}
      </span>
    </div>
  );
}

/** 取得到佳人時要渲染的完整內容 */
function GirlDetail({ girl }: { girl: Girl }) {
  // 未提供 gallery 時，退回到單張主視覺
  const images = girl.gallery?.length ? girl.gallery : [girl.imageUrl];
  const services = girl.services ?? [];
  const pricing = girl.pricing ?? [];
  const reviews = girl.reviews ?? [];

  return (
    <>
      {/* 頂部導覽列 */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#0B0F19]/90 px-4 py-3 backdrop-blur-md">
        <Link
          href="/"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="返回首頁"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-white">
            {girl.name}
          </h1>
          <p className="truncate text-[11px] text-zinc-500">
            {girl.region} · {girl.nationality}
          </p>
        </div>
        {girl.isHot && (
          <span className="shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
            🔥 熱門
          </span>
        )}
      </header>

      {/* 多圖輪播區 */}
      <ImageCarousel images={images} name={girl.name} />

      {/* 內容區（底部預留空間避開浮動導覽列） */}
      <div className="space-y-4 px-4 pt-2 pb-32">
        {/* 名稱與價格 */}
        <div className="flex items-end justify-between gap-3">
          <h2 className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-2xl font-black text-transparent">
            {girl.name}
          </h2>
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-300">
            {girl.priceLabel}
          </span>
        </div>

        {/* 標籤 */}
        {girl.tags && girl.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {girl.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 核心數據面板 */}
        <section className="rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-950/25 to-black/40 p-4 shadow-[inset_0_0_30px_rgba(251,191,36,0.05)]">
          <h3 className="mb-1 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300">
            <span aria-hidden="true">◆</span> 核心數據
          </h3>
          <DataRow label="地區" value={`📍 ${girl.region}`} />
          <DataRow label="國籍" value={`🌏 ${girl.nationality}`} />
          <DataRow
            label="身材數據"
            value={`${girl.age}歲 / ${girl.height}cm / ${girl.weight}kg / ${girl.cup}罩杯`}
          />
        </section>

        {/* 基礎消費 */}
        {pricing.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-400/[0.08] to-white/[0.02]">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-1">
              <h3 className="flex items-center gap-2 text-sm font-bold tracking-widest text-amber-200">
                <span aria-hidden="true">◆</span> 基礎消費
              </h3>
              <span className="rounded-full bg-gradient-to-r from-amber-300 to-yellow-500 px-2.5 py-1 text-[10px] font-bold whitespace-nowrap text-black">
                現金交易／不轉帳／不匯款／不點數
              </span>
            </div>
            <div className="px-4 pt-1 pb-3">
              {pricing.map((plan) => (
                <PricingRow
                  key={plan.label}
                  label={plan.label}
                  priceLabel={plan.priceLabel}
                />
              ))}
            </div>
          </section>
        )}

        {/* 服務內容勾選清單 */}
        {services.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300">
              <span aria-hidden="true">◆</span> 服務內容
            </h3>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              {services.map((service) => (
                <ServiceItem key={service} text={service} />
              ))}
            </ul>
          </section>
        )}

        {/* 客評截圖（由後端統一上傳，非互動評價區） */}
        {reviews.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-amber-300">
              <span aria-hidden="true">◆</span> 客評截圖
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {reviews.map((src, index) => (
                <figure
                  key={`${src}-${index}`}
                  className="overflow-hidden rounded-xl border border-white/10 bg-black/40"
                >
                  <Image
                    src={src}
                    alt={`${girl.name} 客評截圖 ${index + 1}`}
                    width={300}
                    height={480}
                    sizes="(max-width: 448px) 50vw, 200px"
                    unoptimized
                    className="h-auto w-full object-cover"
                  />
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* 防詐提醒 */}
        <p className="rounded-xl border border-amber-500/25 bg-amber-950/25 px-3.5 py-3 text-[11px] leading-relaxed text-amber-200/80">
          ⚠️ 官方公告：近期詐騙頻繁，唯一指定 LINE 客服請認明官方綠色盾牌，其餘皆為詐騙！
        </p>
      </div>

      {/* 底部雙按鈕浮動導覽列 */}
      <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-[#0B0F19]/95 px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        <div className="flex gap-3">
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 flex-[1.3] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-sm font-bold text-white shadow-[0_6px_24px_rgba(16,185,129,0.4)] transition-transform duration-200 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 5.58 2 10c0 3.86 3.4 7.1 8 7.83.36.08.86.25.98.57.11.29.07.73.03 1.02l-.16 1.02c-.05.31-.23 1.21 1.06.66 1.29-.56 6.96-4.1 9.5-7.01C22.74 12.65 23 11.36 23 10c0-4.42-4.48-8-11-8z" />
            </svg>
            立即加 LINE 預約
          </a>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 text-sm font-bold text-white shadow-[0_6px_24px_rgba(56,189,248,0.4)] transition-transform duration-200 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M21.94 4.6 19.2 19.1c-.2 1-.8 1.25-1.62.78l-4.47-3.3-2.16 2.08c-.24.24-.44.44-.9.44l.32-4.53 8.26-7.46c.36-.32-.08-.5-.55-.18L7.6 13.2 3.2 11.78c-.96-.3-.98-.96.2-1.42l16.9-6.52c.8-.3 1.5.2 1.64.76z" />
            </svg>
            加入 TG 交流群
          </a>
        </div>
      </nav>
    </>
  );
}

/** Suspense 內層：解析 params + 向 Supabase 查詢（整段請求期串流） */
async function GirlDetailLoader({ params }: ProductPageProps) {
  const { id } = await params;
  // 直接向 Supabase 查詢單一模特兒；找不到或已下架則 404
  const girl = await fetchGirlById(id);

  // 下架對象前台不可見，同樣導向 not-found（後台仍可管理）
  if (!girl || girl.isActive === false) {
    notFound();
  }

  return <GirlDetail girl={girl} />;
}

/** Suspense 外層骨架：查詢中顯示載入動畫 */
function DetailSkeleton() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
      <p className="text-sm text-zinc-400">載入佳人資料中…</p>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <div className="relative mx-auto w-full max-w-md">
        <Suspense fallback={<DetailSkeleton />}>
          <GirlDetailLoader params={params} />
        </Suspense>
      </div>
    </div>
  );
}

