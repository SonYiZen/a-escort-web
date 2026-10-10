"use client";

/**
 * 後台共用：客評截圖上傳器（僅圖片，可多選＋預覽＋刪除）
 * 路徑：components/admin/ReviewsUploader.tsx
 *
 * 兩種狀態：existingUrls（已上架的網址）＋ files（本次新增待上傳）。
 * 上傳動作延到表單提交時統一執行，此元件只管選擇與預覽。
 */

export interface ReviewDraft {
  existingUrls: string[];
  files: File[];
  previews: string[];
}

const inputClass =
  "w-full rounded-xl border border-dashed border-amber-400/40 bg-black/40 px-3.5 py-3 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-amber-300 file:to-yellow-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-black";

export default function ReviewsUploader({
  value,
  onChange,
  onError,
}: {
  value: ReviewDraft;
  onChange: (next: ReviewDraft) => void;
  onError: (message: string) => void;
}) {
  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length !== files.length) {
      onError("客評截圖只能上傳圖片（JPG/PNG/WebP/GIF）。");
    }
    const previews = images.map((f) => URL.createObjectURL(f));
    onChange({
      existingUrls: value.existingUrls,
      files: [...value.files, ...images],
      previews: [...value.previews, ...previews],
    });
    event.target.value = "";
  }

  function removeNew(index: number) {
    URL.revokeObjectURL(value.previews[index]);
    onChange({
      existingUrls: value.existingUrls,
      files: value.files.filter((_, i) => i !== index),
      previews: value.previews.filter((_, i) => i !== index),
    });
  }

  function removeExisting(index: number) {
    onChange({
      existingUrls: value.existingUrls.filter((_, i) => i !== index),
      files: value.files,
      previews: value.previews,
    });
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleSelect}
        className={inputClass}
      />
      <p className="text-[11px] text-zinc-500">
        僅限圖片（JPG/PNG/WebP/GIF，單張 10MB 內），可一次多選
      </p>
      {(value.existingUrls.length > 0 || value.previews.length > 0) && (
        <div className="grid grid-cols-3 gap-2">
          {value.existingUrls.map((url, index) => (
            <div
              key={`existing-${url}-${index}`}
              className="relative overflow-hidden rounded-xl border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`已上架客評 ${index + 1}`}
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeExisting(index)}
                aria-label={`刪除已上架客評 ${index + 1}`}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-red-300 hover:bg-black/90"
              >
                ✕
              </button>
            </div>
          ))}
          {value.previews.map((preview, index) => (
            <div
              key={`new-${preview}-${index}`}
              className="relative overflow-hidden rounded-xl border border-amber-400/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={`待上傳客評 ${index + 1}`}
                className="h-28 w-full object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-black">
                待上傳
              </span>
              <button
                type="button"
                onClick={() => removeNew(index)}
                aria-label={`移除待上傳客評 ${index + 1}`}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-red-300 hover:bg-black/90"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
