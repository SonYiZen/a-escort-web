"use client";

/**
 * 首頁：組合跑馬燈／篩選器／圖卡清單／浮動導覽列
 * 路徑：app/page.tsx
 *
 * 資料來源：Supabase girls 表（is_active = true），未設定 env 時降級為 mockData。
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import FilterModal from "@/components/FilterModal";
import FilterSection from "@/components/FilterSection";
import GirlCard from "@/components/GirlCard";
import { girlsData, LINE_URL, TELEGRAM_URL } from "@/data/mockData";
import { fetchActiveGirls } from "@/lib/girls";
import type { FilterState, Girl } from "@/types";

/** 初始篩選狀態：三個維度皆為「全部」 */
const initialFilters: FilterState = {
  region: "全部",
  nationality: "全部",
  budget: "全部",
};

/** 判斷單一佳人是否符合目前的篩選條件 */
function matchesFilters(girl: Girl, filters: FilterState): boolean {
  // 地區：「竹東/竹南」為複合選項
  if (filters.region !== "全部") {
    const isMatch =
      filters.region === "竹東/竹南"
        ? girl.region === "竹東" || girl.region === "竹南"
        : girl.region === filters.region;
    if (!isMatch) return false;
  }

  // 國籍
  if (filters.nationality !== "全部" && girl.nationality !== filters.nationality) {
    return false;
  }

  // 預算級距（以 priceRange 為主，避免重複以數字判斷）
  if (filters.budget !== "全部" && girl.priceRange !== filters.budget) {
    return false;
  }

  return true;
}

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Supabase 資料：先用 mockData 佔位避免首屏空白，載入完成後替換
  const [girls, setGirls] = useState<Girl[]>(girlsData);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 向 Supabase 撈取上架中的完整資料（僅 is_active = true）
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const rows = await fetchActiveGirls();
        if (!cancelled) {
          setGirls(rows);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "載入失敗");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** 更新某個維度的篩選值，其餘條件保留，達成多維度連動過濾 */
  const handleFilterChange = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /** 開啟／關閉篩選彈出視窗 */
  const openFilter = useCallback(() => setIsFilterOpen(true), []);
  const closeFilter = useCallback(() => setIsFilterOpen(false), []);

  /** 依目前條件過濾後的清單（地區／國籍／預算三維連動） */
  const filteredGirls = useMemo(
    () => girls.filter((girl) => matchesFilters(girl, filters)),
    [girls, filters],
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* 手機寬度容器，置中呈現 */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col">
        <FilterSection filters={filters} onOpenFilter={openFilter} />

        {/* 篩選條件彈出視窗（Bottom Sheet） */}
        <FilterModal
          isOpen={isFilterOpen}
          filters={filters}
          resultCount={filteredGirls.length}
          onFilterChange={handleFilterChange}
          onClose={closeFilter}
        />

        {/* 品牌標題區 */}
        <header className="px-4 pt-5 pb-2">
          <h1 className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-2xl font-black tracking-wide text-transparent">
            尊爵嚴選 · 一夜女伴
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            新竹地區高端預約平台｜美甲 · 精油 · 模特兒伴遊
          </p>
        </header>

        {/* 卡片清單 */}
        <main className="flex-1 px-4 pt-3 pb-32">
          {isLoading ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
              <p className="text-sm text-zinc-400">載入佳人資料中…</p>
            </div>
          ) : loadError ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">⚠️</span>
              <p className="text-sm text-zinc-400">資料載入失敗：{loadError}</p>
              <p className="text-xs text-zinc-600">目前顯示備用資料，請稍後再試</p>
            </div>
          ) : filteredGirls.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredGirls.map((girl) => (
                <GirlCard key={girl.id} girl={girl} />
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">🔍</span>
              <p className="text-sm text-zinc-400">
                目前沒有符合條件的佳人
              </p>
              <p className="text-xs text-zinc-600">
                請嘗試調整地區、國籍或預算條件
              </p>
            </div>
          )}
        </main>

        {/* 底部浮動導覽列 */}
        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-[#0B0F19]/95 px-4 pt-3 pb-5 backdrop-blur-lg">
          <div className="flex gap-3">
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-sm font-bold text-white shadow-[0_6px_24px_rgba(16,185,129,0.4)] transition-transform duration-200 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 5.58 2 10c0 3.86 3.4 7.1 8 7.83.36.08.86.25.98.57.11.29.07.73.03 1.02l-.16 1.02c-.05.31-.23 1.21 1.06.66 1.29-.56 6.96-4.1 9.5-7.01C22.74 12.65 23 11.36 23 10c0-4.42-4.48-8-11-8z" />
              </svg>
              官方 LINE 預約
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
              Telegram 交流群
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
