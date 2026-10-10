/**
 * 找不到佳人時顯示的 404 畫面
 * 路徑：app/product/[id]/not-found.tsx
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0F19] px-6 text-center text-white">
      <span className="text-5xl" aria-hidden="true">
        💤
      </span>
      <h1 className="text-lg font-bold text-white">
        此對象暫時不在線或已被下架
      </h1>
      <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
        您查詢的佳人目前無法提供服務，可能是已下架或暫時休息。
        歡迎回到首頁瀏覽其他佳人。
      </p>
      <Link
        href="/"
        className="mt-2 flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-500 px-8 text-sm font-bold text-black shadow-[0_0_18px_rgba(251,191,36,0.35)] transition-transform active:scale-95"
      >
        ← 返回首頁
      </Link>
    </div>
  );
}
