/**
 * 單一佳人圖卡
 * 路徑：components/GirlCard.tsx
 */

import Image from "next/image";
import Link from "next/link";
import type { Girl } from "@/types";

export default function GirlCard({ girl }: { girl: Girl }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-lg shadow-black/40 transition-all duration-300 hover:border-amber-400/40 hover:shadow-amber-500/10">
      {/* 照片區 */}
      <div className="relative aspect-3/4 w-full overflow-hidden">
        <Image
          src={girl.imageUrl}
          alt={`${girl.name} 照片`}
          fill
          sizes="(max-width: 448px) 45vw, 200px"
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* 熱門徽章 */}
        {girl.isHot && (
          <span className="absolute top-2 left-2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            🔥 熱門
          </span>
        )}

        {/* 價格浮標 */}
        <span className="absolute top-2 right-2 rounded-full border border-amber-300/40 bg-black/70 px-2 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-sm">
          {girl.priceLabel}
        </span>

        {/* 底部漸層遮罩，讓文字更清楚 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/70 to-transparent" />
      </div>

      {/* 內容區 */}
      <div className="space-y-2.5 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-base font-bold text-white">{girl.name}</h3>
          <span className="shrink-0 text-sm font-semibold text-amber-300">
            {girl.priceLabel}
          </span>
        </div>

        {/* 地區與國籍標籤 */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
            📍 {girl.region}
          </span>
          <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-200">
            🌏 {girl.nationality}
          </span>
        </div>

        {/* 身材數據 */}
        <p className="rounded-lg border border-white/5 bg-black/30 px-2.5 py-1.5 text-[11px] leading-relaxed text-zinc-400">
          {girl.age}歲 · {girl.height}cm · {girl.weight}kg ·{" "}
          <span className="text-amber-200">{girl.cup}罩杯</span>
        </p>

        {/* 服務標籤 */}
        {girl.tags && girl.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {girl.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 金色閃爍「查看詳情」按鈕 */}
        <Link
          href={`/product/${girl.id}`}
          className="relative block w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-[length:200%_100%] px-4 py-2.5 text-center text-sm font-bold text-black shadow-[0_0_18px_rgba(251,191,36,0.35)] transition-all duration-300 hover:shadow-[0_0_26px_rgba(251,191,36,0.6)] active:scale-[0.98] animate-shimmer"
        >
          <span className="relative z-10">查看詳情 ✨</span>
          {/* 掠光效果 */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shine" />
        </Link>
      </div>
    </article>
  );
}
