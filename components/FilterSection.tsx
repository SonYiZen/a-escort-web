"use client";

/**
 * 公告跑馬燈 + 篩選入口列（點擊開啟底部彈出視窗）
 * 路徑：components/FilterSection.tsx
 */

import { announcementText } from "@/data/mockData";
import type { FilterState } from "@/types";

interface FilterSectionProps {
  /** 目前選中的篩選狀態（用於顯示條件摘要與啟用數量） */
  filters: FilterState;
  /** 開啟篩選彈出視窗 */
  onOpenFilter: () => void;
}

/** 計算目前啟用了幾個非「全部」的條件，用於按鈕徽章 */
function countActiveFilters(filters: FilterState): number {
  return (["region", "nationality", "budget"] as const).filter(
    (key) => filters[key] !== "全部",
  ).length;
}

export default function FilterSection({
  filters,
  onOpenFilter,
}: FilterSectionProps) {
  const activeCount = countActiveFilters(filters);

  /** 目前條件摘要：未設定時顯示提示文字 */
  const activeLabels = (["region", "nationality", "budget"] as const)
    .map((key) => filters[key])
    .filter((value) => value !== "全部");

  return (
    <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0B0F19]/90 backdrop-blur-md">
      {/* 頂部公告跑馬燈 */}
      <div
        className="flex items-center gap-2 overflow-hidden border-b border-amber-500/20 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-amber-950/60 py-1.5"
        role="status"
        aria-live="polite"
      >
        <div className="marquee-track flex shrink-0 whitespace-nowrap">
          {/* 內容重複兩次，配合 translateX(-50%) 達成無縫循環 */}
          <span className="marquee-content px-3 text-[11px] font-medium text-amber-200">
            {announcementText}
          </span>
          <span
            className="marquee-content px-3 text-[11px] font-medium text-amber-200"
            aria-hidden="true"
          >
            {announcementText}
          </span>
        </div>
      </div>

      {/* 篩選入口列 */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* 目前條件摘要 */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-widest text-amber-300/70">
            篩選條件
          </p>
          <p className="truncate text-xs text-zinc-400">
            {activeLabels.length > 0 ? (
              <span className="text-amber-200">{activeLabels.join(" · ")}</span>
            ) : (
              "尚未設定，點擊右側按鈕篩選佳人"
            )}
          </p>
        </div>

        {/* 開啟彈出視窗按鈕 */}
        <button
          type="button"
          onClick={onOpenFilter}
          aria-haspopup="dialog"
          aria-expanded={false}
          className="relative flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-300/20 to-yellow-500/20 px-4 py-2 text-xs font-bold text-amber-200 transition-all hover:border-amber-300 hover:text-amber-100 active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M3 6h18M7 12h10M10 18h4" />
          </svg>
          篩選
          {/* 啟用條件數量徽章 */}
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-[10px] font-bold text-white shadow-md">
              {activeCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

