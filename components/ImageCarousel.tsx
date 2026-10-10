"use client";

/**
 * 多圖輪播區（Gallery）
 * 路徑：components/ImageCarousel.tsx
 *
 * 大圖主視覺 + 下方縮圖切換，使用原生 useState 控制，
 * 並支援左右箭頭、鍵盤方向鍵與觸控滑動。
 */

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ImageCarouselProps {
  /** 圖片網址清單 */
  images: string[];
  /** 用於 alt 文字的名稱 */
  name: string;
}

export default function ImageCarousel({ images, name }: ImageCarouselProps) {
  const total = images.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  /** 記錄上一次的圖片清單，用於在渲染期間偵測「換了對象」 */
  const [previousImages, setPreviousImages] = useState(images);

  // 圖片清單變動（換了佳人）時，重置回第一張
  if (images !== previousImages) {
    setPreviousImages(images);
    setActiveIndex(0);
  }

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  /** 支援鍵盤左右鍵切換 */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goToPrevious();
      if (event.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  /** 觸控滑動切換（手機手勢） */
  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    // 滑動距離需超過 50px 才切換，避免誤觸
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) goToPrevious();
      else goToNext();
    }
    setTouchStartX(null);
  };

  return (
    <div className="relative">
      {/* 主圖 */}
      <div
        className="relative aspect-3/4 w-full overflow-hidden bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={activeIndex}
          src={images[activeIndex]}
          alt={`${name} 照片 ${activeIndex + 1}`}
          fill
          sizes="(max-width: 448px) 100vw, 448px"
          priority={activeIndex === 0}
          unoptimized
          className="object-cover transition-opacity duration-300"
        />

        {/* 底部漸層遮罩 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B0F19] to-transparent" />

        {/* 圖片計數器 */}
        <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {activeIndex + 1} / {total}
        </span>

        {/* 左右切換箭頭（多張時才顯示） */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="上一張"
              className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="下一張"
              className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* 縮圖切換列 */}
      {total > 1 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-4 py-3">
          {images.map((src, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`查看第 ${index + 1} 張照片`}
                aria-current={isActive}
                className={[
                  "relative h-16 w-14 shrink-0 overflow-hidden rounded-lg transition-all duration-200",
                  isActive
                    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0B0F19]"
                    : "opacity-55 hover:opacity-100",
                ].join(" ")}
              >
                <Image
                  src={src}
                  alt={`${name} 縮圖 ${index + 1}`}
                  fill
                  sizes="56px"
                  unoptimized
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
