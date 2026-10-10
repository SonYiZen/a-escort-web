"use client";

/**
 * 篩選條件底部彈出視窗（Bottom Sheet）
 * 路徑：components/FilterModal.tsx
 *
 * 說明：透過 createPortal 掛到 document.body，避免外層 sticky 容器上的
 * backdrop-blur 建立 containing block 而導致 fixed 定位失效。
 */

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { filterLabels, filterOptions } from "@/data/mockData";
import type { FilterState } from "@/types";

/** 篩選狀態的欄位鍵 */
type FilterKey = keyof FilterState;

/** 關閉動畫時長（需與 globals.css 的 sheet-out 一致） */
const EXIT_DURATION = 260;

interface FilterModalProps {
  /** 是否開啟 */
  isOpen: boolean;
  /** 目前選中的篩選狀態 */
  filters: FilterState;
  /** 符合條件的筆數，即時顯示於彈出視窗內 */
  resultCount: number;
  /** 切換某個維度的選項 */
  onFilterChange: <K extends FilterKey>(
    key: K,
    value: FilterState[K],
  ) => void;
  /** 關閉彈出視窗 */
  onClose: () => void;
}

/** 單一維度的篩選按鈕列（彈出視窗內改為自動換行排列） */
function FilterRow<K extends FilterKey>({
  filterKey,
  label,
  options,
  activeValue,
  onSelect,
}: {
  filterKey: K;
  label: string;
  options: readonly FilterState[K][];
  activeValue: FilterState[K];
  onSelect: (key: K, value: FilterState[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium tracking-widest text-amber-300/70">
        {label}
      </span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => {
          const isActive = option === activeValue;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(filterKey, option)}
              className={[
                "rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200",
                "active:scale-95",
                isActive
                  ? "border-amber-400/80 bg-gradient-to-r from-amber-300 to-yellow-500 text-black shadow-[0_0_14px_rgba(251,191,36,0.45)]"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-amber-400/40 hover:text-amber-200",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterModal({
  isOpen,
  filters,
  resultCount,
  onFilterChange,
  onClose,
}: FilterModalProps) {
  /** 是否正在播放關閉動畫（動畫播完才真正卸載） */
  const [isClosing, setIsClosing] = useState(false);

  /** 記錄上一次的開啟狀態，用於在渲染期間偵測「剛被開啟」 */
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    // 重新開啟時重置關閉動畫狀態（渲染期間直接設定，React 會自動重跑 render）
    if (isOpen) setIsClosing(false);
  }

  /** 開啟時鎖定背景捲動，關閉後還原 */
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  /** 點擊關閉：先播放下滑動畫，動畫結束再通知父元件卸載 */
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, EXIT_DURATION);
  }, [isClosing, onClose]);

  /** 支援 Escape 鍵關閉 */
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  /** 一鍵重設：三個維度全部還原為「全部」 */
  const handleReset = useCallback(() => {
    onFilterChange("region", "全部");
    onFilterChange("nationality", "全部");
    onFilterChange("budget", "全部");
  }, [onFilterChange]);

  // SSR 階段沒有 document，直接不渲染；關閉且非動畫中則卸載
  if (typeof document === "undefined" || (!isOpen && !isClosing)) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      {/* 半透明背景，點擊即可關閉 */}
      <div
        className={
          isClosing
            ? "absolute inset-0 bg-black/70 backdrop-blur-sm animate-backdrop-out"
            : "absolute inset-0 bg-black/70 backdrop-blur-sm animate-backdrop-in"
        }
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 彈出視窗本體 */}
      <div
        className={
          isClosing
            ? "relative w-full max-w-md rounded-t-3xl border-t border-amber-400/20 bg-[#111827] shadow-[0_-8px_40px_rgba(0,0,0,0.6)] animate-sheet-out"
            : "relative w-full max-w-md rounded-t-3xl border-t border-amber-400/20 bg-[#111827] shadow-[0_-8px_40px_rgba(0,0,0,0.6)] animate-sheet-in"
        }
      >
        {/* 頂部拖曳提示條 */}
        <div className="flex justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* 標題列 */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h2
            id="filter-modal-title"
            className="text-base font-bold text-white"
          >
            篩選條件
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="關閉篩選"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 三個維度的篩選列 */}
        <div className="max-h-[55vh] space-y-4 overflow-y-auto px-5 py-3">
          <FilterRow<"region">
            filterKey="region"
            label={filterLabels.region}
            options={filterOptions.region}
            activeValue={filters.region}
            onSelect={onFilterChange}
          />
          <FilterRow<"nationality">
            filterKey="nationality"
            label={filterLabels.nationality}
            options={filterOptions.nationality}
            activeValue={filters.nationality}
            onSelect={onFilterChange}
          />
          <FilterRow<"budget">
            filterKey="budget"
            label={filterLabels.budget}
            options={filterOptions.budget}
            activeValue={filters.budget}
            onSelect={onFilterChange}
          />
        </div>

        {/* 底部操作列 */}
        <div className="space-y-3 border-t border-white/5 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <p className="text-center text-[11px] text-zinc-500">
            共找到{" "}
            <span className="font-semibold text-amber-300">{resultCount}</span>{" "}
            位符合條件的佳人
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="h-12 flex-1 rounded-2xl border border-white/15 bg-white/5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 active:scale-[0.98]"
            >
              重設條件
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="h-12 flex-[1.4] rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-500 text-sm font-bold text-black shadow-[0_0_18px_rgba(251,191,36,0.35)] transition-all active:scale-[0.98]"
            >
              確認並查看
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

